"use strict";

const tap = require("tap");
const fixedSort = require("..");

tap.test("literal ordering", async () => {
  const sorter = fixedSort(["one", "two", "three"]);
  tap.same(["four", "six", "one", "five", "three", "two"].sort(sorter), [
    "one",
    "two",
    "three",
    "five",
    "four",
    "six"
  ]);
});

tap.test("ordering function", async () => {
  const ranker = val => {
    if (/xx/.test(val)) return -1;
    if (/z/.test(val)) return -2;
    if (/y/.test(val)) return -3;
    if (/x/.test(val)) return -4;
    return 0;
  };

  const data = ["x", "y", "xy", "z", "xz", "yz", "xyz", "xxyz", "c", "a", "bb"];
  const want = ["x", "xy", "y", "xyz", "xz", "yz", "z", "xxyz", "a", "bb", "c"];
  const fs = fixedSort(ranker);
  data.sort(fs);
  tap.same(data, want);
});

tap.test("regex, function matchers", async () => {
  const data = [
    "FrippoPage",
    "HEADER",
    "Smoo",
    1,
    "ModelIssue",
    "Andy",
    "ModelPage",
    "FrippoIssue",
    "ElementIssue",
    3,
    3,
    2,
    "ElementPage",
    "HEADER",
    "Pizzo",
    9,
    1
  ];

  const want = [
    "ElementIssue",
    "ElementPage",
    "ModelIssue",
    "ModelPage",
    "FrippoIssue",
    "FrippoPage",
    1,
    1,
    2,
    3,
    3,
    9,
    "HEADER",
    "HEADER",
    "Andy",
    "Pizzo",
    "Smoo"
  ];

  const fs = fixedSort([/^Element/, /^Model/, /^Frippo/, Number, "HEADER"]);

  data.sort(fs);
  tap.same(data, want);
});

tap.test("fallback", async () => {
  const fs = fixedSort(
    ["first", "second", "third"],
    fixedSort(
      [/^s/, /^f/],
      (a, b) => a.length - b.length || (a > b ? -1 : a > b ? 1 : 0)
    )
  );

  const data = [
    "first",
    "second",
    "third",
    "fourth",
    "fifth",
    "sixth",
    "a long string",
    "z",
    "zz",
    "d",
    "e",
    "f"
  ];

  const want = [
    "first",
    "second",
    "third",
    "sixth",
    "f",
    "fifth",
    "fourth",
    "z",
    "e",
    "d",
    "zz",
    "a long string"
  ];

  data.sort(fs);
  tap.same(data, want);
});

tap.test("fallback with interactions", async () => {
  const fs = fixedSort([/C/, /B/, /A/], fixedSort([/z/, /y/, /x/]));
  const data = [
    "wA",
    "wB",
    "wC",
    "wD",
    "xA",
    "xB",
    "xC",
    "xD",
    "yA",
    "yB",
    "yC",
    "yD",
    "zA",
    "zB",
    "zC",
    "zD"
  ];
  const want = [
    "zC",
    "yC",
    "xC",
    "wC",
    "zB",
    "yB",
    "xB",
    "wB",
    "zA",
    "yA",
    "xA",
    "wA",
    "zD",
    "yD",
    "xD",
    "wD"
  ];

  data.sort(fs);
  tap.same(data, want);
});
