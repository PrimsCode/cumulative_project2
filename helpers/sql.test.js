const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function () {
  test("updating 1 item", function () {
    const result = sqlForPartialUpdate(
        { field1: "data1" },
        { field1: "field_1", field2: "field_2" });
    expect(result).toEqual({
      setCols: "\"field_1\"=$1",
      values: ["data1"],
    });
  });

  test("updating 2 items", function () {
    const result = sqlForPartialUpdate(
        { field1: "data1", field2: "data2" },
        { field1: "field_1", field2: "field_2" });
    expect(result).toEqual({
      setCols: "\"field_1\"=$1, \"field_2\"=$2",
      values: ["data1", "data2"],
    });
  });
});
