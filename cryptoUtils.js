const crypto = require("crypto");

const createKeyPair = () => {
  const curve = "secp521r1";
  const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", {
    namedCurve: curve,
  });
  const publicKeyDer = publicKey
    .export({ type: "spki", format: "der" })
    .toString("base64");
  return {
    privateKey: privateKey
      .export({ type: "sec1", format: "der" })
      .toString("base64"),
    publicKey: publicKeyDer,
    address:
      "s1" +
      Buffer.from(sha256(sha256(publicKeyDer)), "hex")
        .toString("base64")
        .replace("/", "")
        .replace("+", "")
        .slice(0, 28),
  };
};

const sha256 = (data) => {
  const ret = crypto.createHash("sha256").update(data).digest("hex");
  console.log(ret);
  return ret;
};

module.exports = {
  createKeyPair,
};
