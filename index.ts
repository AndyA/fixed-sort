type Matcher<T> = (v: T) => boolean;
type Ranker<T> = (v: T) => number;
type PureList<T> = T[];
type Term<T> = Matcher<T> | RegExp | T;

export type Comparator<T> = (a: T, b: T) => number;
export type FixedSortSpec<T> = Term<T>[] | Ranker<T>;

const isPureList = <T>(list: FixedSortSpec<T>): list is PureList<T> =>
  Array.isArray(list) &&
  !list.some(t => t instanceof RegExp || t instanceof Function);

function termToMatcher<T>(t: Term<T>): Matcher<T> {
  if (t instanceof Function) return t;
  if (t instanceof RegExp) return v => t.test(String(v));
  return v => t === v;
}

function predMatcher<T>(list: Matcher<T>[]) {
  return (val: T) => {
    const pos = list.findIndex(t => t(val));
    return pos < 0 ? list.length : pos;
  };
}

function unique<T>(list: T[]): T[] {
  const seen = new Set<T>();
  const first = (elt: T) => {
    if (seen.has(elt)) return false;
    seen.add(elt);
    return true;
  };
  return list.filter(first);
}

function rankMatcher<T>(list: T[]) {
  const terms = unique(list);
  const ranks: Map<T, number> = new Map(
    terms.map((t: T, i: number) => [t, i - terms.length])
  );
  return (v: T) => ranks.get(v) || 0;
}

function cachedMatcher<T>(match: Ranker<T>) {
  const cache = new Map<T, number>();
  return (val: T) => {
    const hit = cache.get(val);
    if (hit !== undefined) return hit;

    const miss = match(val) || 0;

    if (typeof miss !== "number")
      throw new Error(
        `Rank function returned a ${typeof miss}, should have returned a number.`
      );

    cache.set(val, miss);

    return miss;
  };
}

// Choose implementation based on list type
function makeMatcher<T>(list: FixedSortSpec<T>) {
  // If list contains only literal values we can use a simple
  // map of value => rank.
  if (isPureList(list)) return rankMatcher(list);

  // If we have a ranking function, wrap it in a cache so it's
  // only invoked once for each distinct value.
  if (typeof list === "function") return cachedMatcher(list);

  // Turn a mixed list of RegExps, predicates and literals into
  // into a list of predicates, wrap them in a function that
  // returns the index of the first match and wrap that function
  // with a cache.
  return cachedMatcher(predMatcher(list.map(termToMatcher)));
}

// Make an orderer from a ranker and a fallback comparator
function orderer<T>(m: Ranker<T>, cmp: Comparator<T>) {
  return (a: T, b: T) => m(a) - m(b) || cmp(a, b);
}

// Default comparison preserves original order
const defCmp = (a: any, b: any) => 0;

export default function fixedSort<T>(
  list: FixedSortSpec<T>,
  cmp: Comparator<T> = defCmp
): Comparator<T> {
  return orderer<T>(makeMatcher(list), cmp);
}
