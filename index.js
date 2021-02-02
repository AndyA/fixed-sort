"use strict";

const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

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

const orderer = m => (a, b) => m(a) - m(b) || cmp(a, b);

const cachedMatcher = match =>
  (cache => val =>
    (idx =>
      idx === undefined
        ? (rank => (cache.set(val, rank), rank))(match(val))
        : idx)(cache.get(val)))(new Map());

// List has no RegExp, Function
const noMagic = list => orderer(rankMatcher(list));
// List has RegExp and/or Function
const magic = list => orderer(cachedMatcher(matcher(list)));
// List is a ranking function => rank || -1
const rank = list => orderer(cachedMatcher(list));

const hasMagic = list =>
  list.some(t => t instanceof RegExp || t instanceof Function);

module.exports = list =>
  (list instanceof Function ? rank : hasMagic(list) ? magic : noMagic)(list);
