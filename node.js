const { Shared } = require("./tcpshared.js");
const dotenv = require("dotenv");
const argv = require("minimist")(process.argv.slice(2));
const cu = require("./cryptoUtils.js");
const Blockchain = require("./blockchain.js");

const bc = new Blockchain();

const log = (ob) => {
  console.log(require("util").inspect(ob, false, null, true));
};

dotenv.config();

const port = argv.port ?? process.env.PORT;
const nodes = JSON.parse(process.env.NODES);

const myAddress = cu.createKeyPair();

let lastBlockHash;

if (process.env.TYPE === "Master") {
  const genesis = cu.createGenesis(
    myAddress.address,
    myAddress.privateKey,
    myAddress.publicKey
  );
  log({
    genesis,
    date: new Date(genesis.date),
    index: new Date(genesis.index),
  });
  bc.addBlock(genesis);
  lastBlockHash = genesis.hash;
}

//TEST TRANSACTIONS
const fakeAddresses = [myAddress];
setInterval(() => {
  fakeAddresses.push(cu.createKeyPair());
  for (inputAddress of fakeAddresses) {
    const balance = bc.getBalance(inputAddress.address);
    if (balance > 0) {
      for (outputAddress of fakeAddresses) {
        if (inputAddress.address != outputAddress.address) {
          const tx = cu.createTransaction(
            outputAddress.address,
            outputAddress.privateKey,
            outputAddress.publicKey,
            balance
          );
          console.log("TRASACCION", tx);
        }
      }
    }
  }
}, 3000);

const shared = Shared({
  port,
  validations: {
    test: { validate: (data) => typeof data.value === "number" },
    introduce: { validate: (data) => typeof data.value === "boolean" },
    requestLastBlockHash: {
      validate: (data) => typeof data.value === "boolean",
    },
    lastBlockHash: { validate: (data) => typeof data.value === "string" },
    requestBlock: { validate: (data) => typeof data.value === "string" },
    block: { validate: (data) => typeof data.value === "object" },
  },
});

shared.subscribe(null, (data) => {
  const client = shared[data.path[0]];
  const pathString = data.path.slice(1).join(".");
  switch (pathString) {
    case "requestLastBlockHash":
      if (lastBlockHash) {
        client.lastBlockHash = lastBlockHash;
      }
      break;
    /*case "lastBlockHash":
      if (!blockchain[data.value]) {
        client.requestBlock = data.value;
      }
      break;
    case "requestBlock":
      if (blockchain[data.value]) {
        client.block = blockchain[data.value];
      }
      break;
    case "block":
      //TODO VALIDATE BLOCK
      blockchain[data.value.hash] = data.value;
      lastBlockHash = data.value.hash;*/
  }
});

setInterval(() => {
  //shared.server.test = Math.floor(Math.random() * 100);
  //console.log("CLIETNS", Object.keys(shared._));

  for (const [key, client] of shared) {
    if (!client.lastBlockHash) {
      client.requestLastBlockHash = true;
    }
    //client.test = Math.floor(Math.random() * 100);
  }
}, 10000);

(async () => {
  //sleep 100
  await new Promise((resolve, reject) => setTimeout(resolve, 1000));
  for (const peerIpAddress of nodes) {
    shared._rel.addTcpClient(peerIpAddress);
  }
})();
