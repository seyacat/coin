const crypto = require("crypto");
const { hasSubscribers } = require("diagnostics_channel");
const JSONb = require("json-bigint");

const createKeyPair = () => {
  const curve = "secp521r1";
  const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", {
    namedCurve: curve,
  });
  /*const privateKeyDer = privateKey
    .export({ type: "sec1", format: "der" })
    .toString("base64");
  pktest = crypto.createPrivateKey({
    key: Buffer.from(privateKeyDer, "base64"),
    format: "der",
    type: "sec1",
  });
  pkreder = pktest.export({ type: "sec1", format: "der" }).toString("base64");
  console.log({ pktest });*/

  //const publicKeyDer = publicKey.export({ type: "spki", format: "der" });

  return {
    privateKey,
    publicKey,
    address: createAddress(publicKey),
  };
};

const createAddress = (publicKey) => {
  return (
    "01" +
    Buffer.from(
      sha256(
        Buffer.from(
          sha256(publicKey.export({ type: "spki", format: "der" })),
          "hex"
        )
      ),
      "hex"
    )
      .toString("base64")
      .replace("/", "")
      .replace("+", "")
      .slice(0, 28)
  );
};

const sign = (data, privateKey) => {
  if (typeof data === "string") {
    data = Buffer.from(data);
  }
  const ret = crypto.sign("SHA256", data, privateKey);
  return ret.toString("base64");
};

const createTransaction = (address, privateKey, publicKey, amount) => {
  const data = JSONb.stringify({
    version: 1,
    inputs: ["coinbase"],
    publicKey: publicKey
      .export({ type: "spki", format: "der" })
      .toString("base64"),
    nonce: 0,
    outputs: [{ address, amount }],
    date: Date.now(),
  });
  const signature = sign(data, privateKey);
  /*console.log({ publicKey });
  //VERIFY
  console.log(
    "VERIFY PRIVATE",
    crypto.verify("SHA256", data, privateKey, Buffer.from(signature, "base64"))
  );
  console.log(
    "VERIFY PUBLIC",
    crypto.verify("SHA256", data, publicKey, Buffer.from(signature, "base64"))
  );*/
  const tx = {
    data,
    signature,
  };
  transaction = { tx, hash: sha256(JSONb.stringify(tx)) };
  return transaction;
};

const createGenesis = (address, privateKey, publicKey) => {
  const initialTransaction = createTransaction(
    address,
    privateKey,
    publicKey,
    1000000
  );

  const transactions = [initialTransaction];
  const hash = sha256(JSONb.stringify(transactions));

  block = {
    index: Math.floor(Date.now() / 1000 / 60 / 5 - 1) * 5 * 60 * 1000,
    transactions: transactions,
    previousHash: null,
    hash,
    date: Date.now() - 5 * 60 * 1000,
  };
  return block;
};

const sha256 = (data) => {
  const ret = crypto.createHash("sha256").update(data).digest("hex");
  return ret;
};

module.exports = {
  createKeyPair,
  createGenesis,
  createTransaction,
};
