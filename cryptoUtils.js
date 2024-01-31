const crypto = require("crypto");
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
  const address64 =
    "v1" +
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
      .slice(0, 28);

  const address62 = convertBase(address64, 64, 62);
  //console.log(address64);
  //console.log(convertBase(address62, 62, 64));
  //console.log(address64 == convertBase(address62, 62, 64));

  return address62;
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

  //const transactions = [initialTransaction];
  //const hash = sha256(JSONb.stringify(transactions));

  const balance = {
    vin: [],
    u: null,
    d: null,
    address,
    amount: 1000000,
  };
  data = JSONb.stringify({
    v: 1,
    index: Math.floor(Date.now() / 1000 / 60 / 5 - 1) * 5 * 60 * 1000,
    balances: [balance],
    previousHash: null,
  });

  block = {
    data,
    hash: sha256(data),
  };
  Object.freeze(block);
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

function convertBase(str, fromBase, toBase) {
  let DIGITS =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/";
  let BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

  const add = (x, y, base) => {
    let z = [];
    const n = Math.max(x.length, y.length);
    let carry = 0;
    let i = 0;
    while (i < n || carry) {
      const xi = i < x.length ? x[i] : 0;
      const yi = i < y.length ? y[i] : 0;
      const zi = carry + xi + yi;
      z.push(zi % base);
      carry = Math.floor(zi / base);
      i++;
    }
    return z;
  };

  const multiplyByNumber = (num, x, base) => {
    if (num < 0) return null;
    if (num == 0) return [];

    let result = [];
    let power = x;
    while (true) {
      num & 1 && (result = add(result, power, base));
      num = num >> 1;
      if (num === 0) break;
      power = add(power, power, base);
    }

    return result;
  };

  const parseToDigitsArray = (str, base) => {
    const digits = str.split("");
    let arr = [];
    for (let i = digits.length - 1; i >= 0; i--) {
      const n = DIGITS.indexOf(digits[i]);
      if (n == -1) return null;
      arr.push(n);
    }
    return arr;
  };

  const digits = parseToDigitsArray(str, fromBase);
  if (digits === null) return null;

  let outArray = [];
  let power = [1];
  for (let i = 0; i < digits.length; i++) {
    digits[i] &&
      (outArray = add(
        outArray,
        multiplyByNumber(digits[i], power, toBase),
        toBase
      ));
    power = multiplyByNumber(fromBase, power, toBase);
  }

  let out = "";
  for (let i = outArray.length - 1; i >= 0; i--) out += DIGITS[outArray[i]];

  return out;
}
