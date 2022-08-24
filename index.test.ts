import fixedSort from "./index";

describe("fixedSort", () => {
  it("should order by literals", () => {
    const sorter = fixedSort(["one", "two", "three"]);
    const got = ["four", "six", "one", "five", "three", "two"].sort(sorter);
    const want = ["one", "two", "three", "four", "six", "five"];
    expect(got).toEqual(want);
  });

  it("should order by ranking function", () => {
    const ranker = (val: string): number => {
      if (/xx/.test(val)) return -1;
      if (/z/.test(val)) return -2;
      if (/y/.test(val)) return -3;
      if (/x/.test(val)) return -4;
      return 0;
    };

    const data = [
      ["x", "y", "xy", "z", "xz", "yz"],
      ["xyz", "xxyz", "c", "a", "bb"]
    ].flat();

    const want = [
      ["x", "y", "xy", "z", "xz", "yz"],
      ["xyz", "xxyz", "c", "a", "bb"]
    ].flat();

    const fs = fixedSort(ranker);
    data.sort(fs);
    expect(data).toEqual(want);
  });

  it("should handle regex, function matchers", () => {
    const data = [
      ["FrippoPage", "HEADER", "Smoo", 1, "ModelIssue"],
      ["Andy", "ModelPage", "FrippoIssue", "ElementIssue"],
      [3, 3, 2, "ElementPage", "HEADER", "Pizzo", 9, 1]
    ].flat();

    const want = [
      ["ElementIssue", "ElementPage", "ModelIssue"],
      ["ModelPage", "FrippoPage", "FrippoIssue"],
      [1, 3, 3, 2, 9, 1],
      ["HEADER", "HEADER", "Smoo", "Andy", "Pizzo"]
    ].flat();

    const isNumber = (v: any): boolean => typeof v === "number";
    const fs = fixedSort<string | number>([
      /^Element/,
      /^Model/,
      /^Frippo/,
      isNumber,
      "HEADER"
    ]);

    data.sort(fs);
    expect(data).toEqual(want);
  });

  it("should handle a fallback sorter", () => {
    const fs = fixedSort(
      ["first", "second", "third"],
      fixedSort(
        [/^s/, /^f/],
        (a: string, b: string) =>
          a.length - b.length || (a > b ? -1 : a > b ? 1 : 0)
      )
    );

    const data = [
      ["first", "second", "third", "fourth", "fifth", "sixth"],
      ["a long string", "z", "zz", "d", "e", "f"]
    ].flat();

    const want = [
      ["first", "second", "third", "sixth", "f", "fifth"],
      ["fourth", "z", "e", "d", "zz", "a long string"]
    ].flat();

    data.sort(fs);
    expect(data).toEqual(want);
  });

  it("should handle a fallbacks that interact", () => {
    const fs = fixedSort([/C/, /B/, /A/], fixedSort<string>([/z/, /y/, /x/]));
    const data = [
      ["wA", "wB", "wC", "wD", "xA", "xB", "xC", "xD"],
      ["yA", "yB", "yC", "yD", "zA", "zB", "zC", "zD"]
    ].flat();
    const want = [
      ["zC", "yC", "xC", "wC", "zB", "yB", "xB", "wB"],
      ["zA", "yA", "xA", "wA", "zD", "yD", "xD", "wD"]
    ].flat();

    data.sort(fs);
    expect(data).toEqual(want);
  });

  it("should respect the first instance of a value", () => {
    const fs = fixedSort(["C", "B", "A", "B", "C"]);
    const data = ["A", "B", "C", "_"];
    const want = ["C", "B", "A", "_"];
    data.sort(fs);
    expect(data).toEqual(want);
  });

  // Negative
  it("should throw if ranker returns a non-number", () => {
    const ranker = (v: string): number => {
      // @ts-ignore we want the runtime fail
      if (v === "B") return "X";
      return -v.length;
    };

    const fs = fixedSort(ranker);
    const data = ["A", "AA", "AAA", "BB", "B"];
    expect(() => data.sort(fs)).toThrow(/should have/i);
  });
});
