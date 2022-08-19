type Scalar = string | number | boolean | null;
type Matcher<T extends Scalar> = (v: T) => boolean;
type Ranker<T extends Scalar> = (v: T) => number;
type PureList<T extends Scalar> = T[];
type Term<T extends Scalar> = Matcher<T> | RegExp | T;

type Comparer<T extends Scalar> = (a: T, b: T) => number;

export type FixedSortSpec<T extends Scalar> = Term<T>[] | Ranker<T>;

const isPureList = <T extends Scalar>(
  list: FixedSortSpec<T>
): list is PureList<T> =>
  Array.isArray(list) &&
  !list.some(t => t instanceof RegExp || t instanceof Function);

function termToMatcher<T extends Scalar>(t: Term<T>): Matcher<T> {
  if (t instanceof Function) return t;
  if (t instanceof RegExp) return v => t.test(String(v));
  return v => t === v;
}

function predMatcher<T extends Scalar>(list: Matcher<T>[]) {
  return (val: T) => {
    const pos = list.findIndex(t => t(val));
    return pos < 0 ? list.length : pos;
  };
}

function rankMatcher<T extends Scalar>(list: T[]) {
  const ranks: Map<T, number> = new Map(
    list.map((t: T, i: number) => [t, i - list.length])
  );
  return (v: T) => ranks.get(v) || 0;
}

function cachedMatcher<T extends Scalar>(match: Ranker<T>) {
  const cache = new Map<T, number>();
  return (val: T) => {
    const hit = cache.get(val);
    if (hit !== undefined) return hit;

    const miss = match(val) || 0;
    cache.set(val, miss);
    return miss;
  };
}

// Choose implementation based on list type
function makeMatcher<T extends Scalar>(list: FixedSortSpec<T>) {
  if (isPureList(list)) return rankMatcher(list);
  if (typeof list === "function") return cachedMatcher(list);
  return cachedMatcher(predMatcher(list.map(termToMatcher)));
}

// Make an orderer from a ranker and a fallback comparator
function orderer<T extends Scalar>(m: Ranker<T>, cmp: Comparer<T>) {
  return (a: T, b: T) => m(a) - m(b) || cmp(a, b);
}

// Default comparison
const defCmp = <T extends Scalar>(a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0);

function fixedSort<T extends Scalar>(
  list: FixedSortSpec<T>,
  cmp: Comparer<T> = defCmp
): Comparer<T> {
  return orderer<T>(makeMatcher(list), cmp);
}

export default fixedSort;
