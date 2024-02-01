const { convertBase } = require("../lib/baseConverter");
const cu = require("../lib/cryptoUtils");

var assert = require("assert");
describe("Array", function () {
  describe("#indexOf()", function () {
    it("should return -1 when the value is not present", function () {
      const myAddress = cu.createKeyPair();
      const genesis = cu.createGenesis(
        myAddress.address,
        myAddress.privateKey,
        myAddress.publicKey
      );
      console.log(genesis);
    });
  });
});
