const { convertBase } = require("../lib/baseConverter");

var assert = require("assert");
describe("Array", function () {
  describe("#indexOf()", function () {
    it("should return -1 when the value is not present", function () {
      assert.equal(convertBase("2", 10, 2), "10");
    });
  });
});
