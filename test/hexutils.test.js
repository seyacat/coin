const { bintree } = require("../lib/hexutils");
const hexutils = require("../lib/hexutils");
const assert = require("assert");
const cu = require("../lib/cryptoUtils");

describe("Array", function () {
  describe("#indexOf()", function () {
    it("should return -1 when the value is not present", function () {
      testNumbers = [50, 10, 20, 2, 12, 18].map((h) => {
        return {
          address: cu.createKeyPair().address,
          data: JSON.stringify({ rnd: Math.random(), h: h }),
        };
      });
      console.log("tn", testNumbers);
      const ret = hexutils.bintree(testNumbers);
      console.log(JSON.stringify(ret, null, 2));
    });
  });
});
