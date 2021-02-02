"use strict";

const matcher = list => val =>
  (pos => (pos < 0 ? list.length : pos))(
    list.findIndex(t =>
      t instanceof RegExp
        ? t.test(val)
        : t instanceof Function
        ? t(val)
        : t === val
    )
  );

const rankMatcher = list =>
  (rank => v => rank.get(v) || 0)(
    new Map(list.map((t, i) => [t, i - list.length]))
  );

const orderer = (m, cmp) => (a, b) => m(a) - m(b) || cmp(a, b);

const cachedMatcher = match =>
  (cache => val =>
    (idx =>
      idx === undefined
        ? (rank => (cache.set(val, rank), rank))(match(val))
        : idx)(cache.get(val)))(new Map());

// Choose implementation based on list type
const impl = list =>
  list instanceof Function
    ? list => cachedMatcher(list)
    : list.some(t => t instanceof RegExp || t instanceof Function)
    ? list => cachedMatcher(matcher(list))
    : list => rankMatcher(list);

// Default comparison
const defCmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

module.exports = (list, cmp) => orderer(impl(list)(list), cmp || defCmp);
