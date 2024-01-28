const { Shared } = require("./tcpshared.js");
const dotenv = require("dotenv");
const argv = require("minimist")(process.argv.slice(2));
const cu = require("./cryptoUtils.js");

const log = (ob) => {
  console.log(require("util").inspect(ob, false, null, true));
};

dotenv.config();

const port = argv.port ?? process.env.PORT;
const clients = JSON.parse(process.env.NODES);

const { address, privateKey, publicKey } = cu.createKeyPair();

let lastBlockHash = null;
let blockchain = {};

if (process.env.TYPE === "Master") {
  const genesis = cu.createGenesis(address, privateKey, publicKey);
  log({
    genesis,
  });
  blockchain[genesis.hash] = genesis;
  lastBlockHash = genesis.hash;
}

const shared = Shared({
  port,
  validations: {
    test: { validate: (data) => typeof data.value === "number" },
    introduce: { validate: (data) => typeof data.value === "boolean" },
  },
});

shared.subscribe(null, (data) => {
  //console.log(data.pathString, data.value);
});

shared.clients.subscribe(null, (data) => {
  const client = shared.clients[data.path[0]];
  const pathString = data.path.slice(1).join(".");
  console.log({ pathString, values: data.value });
  switch (pathString) {
    case "RequestLastBlockHash":
      client.lastBlockHash = lastBlockHash;
      break;
    case "LastBlockHash":
      if (!blockchain[data.value]) {
        console.log("NEW BLOCK");
        client.RequestBlock = data.value;
      }
      break;
    case "RequestBlock":
      if (blockchain[data.value]) {
        client.LastBlock = blockchain[data.value];
      }
      break;
  }
});

setInterval(() => {
  if (!shared.server.introduce) {
    //shared.server.introduce = true;
  }

  //shared.server.test = Math.floor(Math.random() * 100);
  //console.log("CLIETNS", Object.keys(shared.clients._));

  for (const [key, client] of shared.clients) {
    if (client.lastBlockHash !== lastBlockHash) {
      client.RequestLastBlockHash = true;
    }
    //client.test = Math.floor(Math.random() * 100);
  }
}, 10000);

(async () => {
  //sleep 100
  await new Promise((resolve, reject) => setTimeout(resolve, 1000));
  for (const address of clients) {
    shared._rel.addTcpClient(address);
  }
})();
