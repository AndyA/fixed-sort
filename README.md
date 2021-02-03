# fixed-sort

Make a sort comparator function for arbitrary orderings.

## Fixed ordering

The `Array.sort()` method accepts an optional comparator function. `fixedSort` generates a comparator function that will place a set of identified items at the start of the sorted data, in the order you specify, with all other items at the end of the array in natural order.

```javascript
const fixedSort = require("fixed-sort");

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
  "second floor", // unused
  "third floor",  // unused
  "attic",
  "roof"
]);

// Sort according to our ordering
data.sort(ord);

console.log(data);
//  [
//    "foundation",   // matched items in our fixed order
//    "ground floor",
//    "first floor",
//    "attic",
//    "roof",         // end of matched items
//    "garage",       // unmatched items in natural order
//    "shed"
//  ];
```

## Defining ordering

In the example above the order of the sort is defined by a list of string literals. Sometimes you want to group whole classes of things together. In the next example all of a book's chapters and all of its indexes are grouped together.

```javascript
const fixedSort = require("fixed-sort");

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
```

The ordering list may also include predicate functions. The above example could instead have been written using predicate functions.

```javascript
// Use functions to match all items of a class
const orderBook = fixedSort([
  "Foreword",
  "Intro",
  v => v.startsWith("Chapter "),
  v => v.startsWith("Appendix "),
  "Index"
]);
```

Predicate functions will be called once for each distinct value in the array being sorted. 

## Fallback comparator

The book example has a gotcha. All of the chapters are in the same group and all of the indexes are in another group. The entries within each group are sorted by their natural ordering (what you get if you call `Array.sort()` with no comparator function). That means that "Chapter 20" will come before "Chapter 3". That's not a feature of this module - it's just how lexical ordering works: "2" comes before "3".

We can fix it by providing a fallback comparator function which looks for embedded numbers and orders by them if possible. Here's the corrected code.

```javascript
const fixedSort = require("fixed-sort");

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

// Natural ordering
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

// Order numerically (+ve integers only) if possible
const numOrder = (a, b) => {
  // Look for +ve integers
  const an = a.match(/\d+/);
  const bn = b.match(/\d+/);

  // If both strings contain numbers order on them
  if (an && bn) return cmp(Number(an[0]), Number(bn[0]));

  // Fall back on natural ordering
  return cmp(a, b);
};

const orderBook = fixedSort(
  [
    "Foreword",
    "Intro",
    /^Chapter \d+/,
    /^Appendix \d+/,
    "Index"
  ],
  // Fallback to numerical ordering which,
  // in turn, falls back to natural ordering
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
```

Now Chapter 20 is in the right place and we can handle a lot more appendices than anyone should ever consider.

### Using a fixedSort as a fallback comparator

You can pass a comparator function created by `fixedSort()` as a fallback.

```javascript
const fixedSort = require("fixed-sort");
const data = ["xA", "xB", "xC", "yA", "yB", "yC"];

// Nested fixedSort
const ordCByx = fixedSort([/C/, /B/], fixedSort([/y/, /x/]));

data.sort(ordCByx);
console.log(data);
//  ["yC", "xC", "yB", "xB", "yA", "xA"];
```

### Passing a ranking function.

We saw that each entry in the ordering list can be

* a literal object (not just strings)
* a RegExp
* a predicate function

For maximum flexibility, instead of passing an ordering list you may pass a function which takes each value and returns its corresponding rank in the resulting sort.

This highly contrived ranker sorts in this order:

1. odd positive integers
2. even positive integers
3. nulls
4. negative non-integers
5. positive non-integers
6. anything else
7. even negative integers
8. even positive integers

```javascript
const fixedSort = require("fixed-sort");

const data = [2, 1.3, 4, 7, null, -4, -3, 3.14, 9, null, -3.2, -1, 11, "f"];

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
//  [
//    7,     // odd positive integers
//    9,
//    11,
//    2,     // even positive integers
//    4,
//    null,  // nulls
//    null,
//    -3.2,  // negative non-integers
//    1.3,   // positive non-integers
//    3.14,
//    "f",   // everything else
//    -4,    // even negative integers
//    -3,    // odd negative integers
//    -1
//  ];
```

The ranking function maps values to the groups in which they belong. The values that denote groups don't have to be integers (as in the example above); in fact they don't even have to be numbers although that's often a convenient choice. The ranking function will be called once for each distinct value in the array being sorted.

### Performance and memory use

Each value in the array being sorted is resolved into its sort rank only once - even though the sort algorithm may visit it many times. The cache for these values is discarded when the function returned by `fixedSort()` goes out of scope.

## License

[MIT](LICENSE)
