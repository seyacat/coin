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
      "01" +
      Buffer.from(sha256(sha256(publicKeyDer)), "hex")
        .toString("base64")
        .replace("/", "")
        .replace("+", "")
        .slice(0, 28),
  };
};

const sign = (data, privateKey) => {
  const sign = crypto.createSign("SHA256");
  sign.update(data);
  const signature = sign.sign(privateKey);
  return signature;
};

newTransaction = (address, publicKey, amount) => {
  transaction = {
    data: {
      version: 1,
      inputs: [],
      publicKey,
      nonce: 0,
      outputs: [(address, amount)],
    },
    signature: "",
  };
};

newGenesis = (address, publicKey) => {
  block = {
    address: address,
    transactions: [newTransaction(address, publicKey, 1000000)],
    nonce: 0,
    previousHash:
      "0000000000000000000000000000000000000000000000000000000000000000",
    hash: "0000000000000000000000000000000000000000000000000000000000000000",
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
