const { bintree } = require("../lib/hexutils");
const hexutils = require("../lib/hexutils");
const assert = require("assert");
const cu = require("../lib/cryptoUtils");

describe("Array", function () {
  describe("#indexOf()", function () {
    it("should return -1 when the value is not present", function () {
      testNumbers = Array.apply(null, Array(500)).map((h) => {
        return JSON.stringify({
          address: cu.createKeyPair().address,
          rnd: Math.random(),
          t: h,
        });
      });
      //console.log("tn", testNumbers);
      const bt = new hexutils.BinTree(testNumbers);
      //console.dir(bt.data, { depth: null, colors: true });
      console.log(bt.toString());
      //console.log("findin", bt.find("0012sdf001"));

      const testAddr = JSON.parse(testNumbers[0]).address;
      console.log({ testAddr });
      console.log("findin", bt.find(testAddr));
    });
  });
});
