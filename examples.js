"use strict";

if (0) {
  const fixedSort = require(".");

  // Some building layers
  const data = [
    "garage",
    "shed",
    "roof",
    "foundation",
    "ground floor",
    "first floor",
    "attic"
  ];

  // Order building layers
  const ord = fixedSort([
    "foundation",
    "ground floor",
    "first floor",
    "second floor",
    "third floor",
    "attic",
    "roof"
  ]);

  // Sort according to our ordering
  data.sort(ord);
  console.log(data);
  //  [
  //    "foundation",
  //    "ground floor",
  //    "first floor",
  //    "attic",
  //    "roof",
  //    "garage",
  //    "shed"
  //  ];
}

if (0) {
  const fixedSort = require(".");

  // This book has got out of shape
  const book = [
    "Chapter 3",
    "Chapter 1",
    "Appendix 1",
    "Intro",
    "Appendix 2",
    "Index",
    "Foreword",
    "Chapter 2"
  ];

  // Use RegExps to match all items of a class
  const orderBook = fixedSort([
    "Foreword",
    "Intro",
    /^Chapter \d+/, // Match any chapter
    /^Appendix \d+/, // Match any appendix
    "Index"
  ]);

  book.sort(orderBook);
  // That's better
  console.log(book);
  //  [
  //    "Foreword",
  //    "Intro",
  //    "Chapter 1",
  //    "Chapter 2",
  //    "Chapter 3",
  //    "Appendix 1",
  //    "Appendix 2",
  //    "Index"
  //  ];
}

if (0) {
  const fixedSort = require(".");

  // This book has got out of shape
  const book = [
    "Chapter 3",
    "Chapter 1",
    "Appendix 1",
    "Intro",
    "Appendix 2",
    "Index",
    "Foreword",
    "Chapter 2"
  ];

  // Use functions to match all items of a class
  const orderBook = fixedSort([
    "Foreword",
    "Intro",
    v => v.startsWith("Chapter "),
    v => v.startsWith("Appendix "),
    "Index"
  ]);

  book.sort(orderBook);
  // That's better
  console.log(book);
  //  [
  //    "Foreword",
  //    "Intro",
  //    "Chapter 1",
  //    "Chapter 2",
  //    "Chapter 3",
  //    "Appendix 1",
  //    "Appendix 2",
  //    "Index"
  //  ];
}

if (0) {
  const fixedSort = require(".");

  // This book has got out of shape
  const book = [
    "Chapter 3",
    "Chapter 1",
    "Chapter 20",
    "Appendix 1",
    "Intro",
    "Appendix 2",
    "Index",
    "Foreword",
    "Chapter 2"
  ];

  // Default ordering
  const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

  // Order numerically (+ve integers only) if possible
  const numOrder = (a, b) => {
    const an = a.match(/\d+/);
    const bn = b.match(/\d+/);
    if (an && bn) return cmp(Number(an[0]), Number(bn[0]));
    // Fall back on default
    return cmp(a, b);
  };

  // Use RegExps to match all items of a class
  const orderBook = fixedSort(
    [
      "Foreword",
      "Intro",
      /^Chapter \d+/, // Match any chapter
      /^Appendix \d+/, // Match any appendix
      "Index"
    ],
    // Fallback ordering function
    numOrder
  );

  book.sort(orderBook);
  console.log(book);
  //  [
  //    "Foreword",
  //    "Intro",
  //    "Chapter 1",
  //    "Chapter 2",
  //    "Chapter 3",
  //    "Chapter 20",
  //    "Appendix 1",
  //    "Appendix 2",
  //    "Index"
  //  ];
}

if (1) {
  const fixedSort = require(".");
  const data = ["xA", "xB", "xC", "yA", "yB", "yC"];

  // Nested fixedSort
  const ordCByx = fixedSort([/C/, /B/], fixedSort([/y/, /x/]));

  data.sort(ordCByx);
  console.log(data);
  //  ["yC", "xC", "yB", "xB", "yA", "xA"];
}

if (0) {
  const fixedSort = require(".");

  const data = [2, 1.3, 4, 7, null, -4, -3, 3.14, 9, null, -3.2, -1, 11, "f"];

  // This highly contrived ranker sorts in this order:
  //  * odd positive integers
  //  * even positive integers
  //  * nulls
  //  * negative non-integers
  //  * positive non-integers
  //  * anything else
  //  * even negative integers
  //  * even positive integers
  const ranker = v => {
    if (v === null) return -1;
    if (!isNaN(v)) {
      if (v < 0) return -ranker(-v);
      if (v === Math.floor(v)) {
        if (v % 2) return -3;
        return -2;
      }
    }
    return 0;
  };

  // No practical use is known for this...
  data.sort(fixedSort(ranker));
  console.log(data);
  [
    7, // odd positive integers
    9,
    11,
    2, // even positive integers
    4,
    null, // nulls
    null,
    -3.2, // negative non-integers
    1.3, // positive non-integers
    3.14,
    "f", // everything else
    -4, // even negative integers
    -3, // odd negative integers
    -1
  ];
}
