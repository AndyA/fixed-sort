type Scalar = string | number | boolean;
type Matcher<T extends Scalar> = (v: T) => boolean;
type Ranker<T extends Scalar> = (v: T) => number;
type ScalarList<T extends Scalar> = T[];
type Term<T extends Scalar> = Matcher<T> | RegExp | T;

type Comparer<T extends Scalar> = (a: T, b: T) => number;

export type FixedSortList<T extends Scalar = Scalar> = Term<T>[] | Ranker<T>;

const isScalarList = <T extends Scalar>(
  list: FixedSortList<T>
): list is ScalarList<T> =>
  Array.isArray(list) &&
  !list.some(t => t instanceof RegExp || t instanceof Function);

const termToMatcher = <T extends Scalar>(t: Term<T>): Matcher<T> => {
  if (t instanceof Function) return t;
  if (t instanceof RegExp) return v => t.test(String(v));
  return v => t === v;
};

const predMatcher =
  <T extends Scalar>(list: Matcher<T>[]) =>
  (val: T) => {
    const pos = list.findIndex(t => t(val));
    return pos < 0 ? list.length : pos;
  };

const rankMatcher = <T extends Scalar>(list: T[]) => {
  const ranks: Map<T, number> = new Map(
    list.map((t: T, i: number) => [t, i - list.length])
  );
  return (v: T) => ranks.get(v) || 0;
};

const cachedMatcher = <T extends Scalar>(match: Ranker<T>) => {
  const cache = new Map<T, number>();
  return (val: T) => {
    const hit = cache.get(val);
    if (hit !== undefined) return hit;

    const miss = match(val) || 0;
    cache.set(val, miss);
    return miss;
  };
};

// Choose implementation based on list type
const makeMatcher = <T extends Scalar>(list: FixedSortList<T>) => {
  if (isScalarList(list)) return rankMatcher(list);
  if (typeof list === "function") return cachedMatcher(list);
  return cachedMatcher(predMatcher(list.map(termToMatcher)));
};

// Make an orderer from a ranker and a fallback comparator
const orderer =
  <T extends Scalar>(m: Ranker<T>, cmp: Comparer<T>) =>
  (a: T, b: T) =>
    m(a) - m(b) || cmp(a, b);

// Default comparison
const defCmp = <T extends Scalar>(a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0);

const fixedSort = <T extends Scalar>(
  list: FixedSortList<T>,
  cmp: Comparer<T> = defCmp
) => orderer<T>(makeMatcher(list), cmp);

export default fixedSort;
