"use strict";

const castPred = t =>
  (t instanceof Function && t) ||
  (t instanceof RegExp && (v => t.test(v))) ||
  (v => t === v);

const predMatcher = list => val =>
  (pos => (pos < 0 ? list.length : pos))(list.findIndex(t => t(val)));

const rankMatcher = list =>
  (ranks => v => ranks.get(v) || 0)(
    new Map(list.map((t, i) => [t, i - list.length]))
  );

const cachedMatcher = match =>
  (cache => val =>
    (idx =>
      (idx !== undefined && idx) ||
      (rank => (cache.set(val, rank), rank))(match(val) || 0))(cache.get(val)))(
    new Map()
  );

// Choose implementation based on list type
const makeMatcher = list =>
  (list instanceof Function && cachedMatcher(list)) ||
  (list.some(t => t instanceof RegExp || t instanceof Function) &&
    cachedMatcher(predMatcher(list.map(castPred)))) ||
  rankMatcher(list);

// Make an orderer from a ranker and a fallback comparator
const orderer = (m, cmp) => (a, b) => m(a) - m(b) || cmp(a, b);

// Default comparison
const defCmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

module.exports = (list, cmp) => orderer(makeMatcher(list), cmp || defCmp);
