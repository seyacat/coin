const crypto = require("crypto");

const createKeyPair = () => {
  const curve = "secp521r1";
  const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", {
    namedCurve: curve,
  });
  return {
    privateKey: privateKey
      .export({ type: "sec1", format: "der" })
      .toString("base64"),
    publicKey: publicKey
      .export({ type: "spki", format: "der" })
      .toString("base64"),
  };
};

module.exports = {
  createKeyPair,
};
