const { Shared } = require("./tcpshared.js");
const dotenv = require("dotenv");
const argv = require("minimist")(process.argv.slice(2));
const cu = require("./cryptoUtils.js");
dotenv.config();

const port = argv.port ?? process.env.PORT;
const clients = JSON.parse(process.env.NODES);

const { privateKey, publicKey } = cu.createKeyPair();

console.log({
  privateKey,
  publicKey,
});

const shared = Shared({
  port,
  validations: {
    test: { validate: (data) => typeof data.value === "number" },
    introduce: { validate: (data) => typeof data.value === "boolean" },
  },
});

shared.subscribe(null, (data) => {
  console.log(data.path, data.value);
});

setInterval(() => {
  //if (argv.port == 12345) {
  shared.server.introduce = true;
  shared.server.test = Math.floor(Math.random() * 100);
  //console.log("CLIETNS", Object.keys(shared.clients._));

  for (const [key, client] of shared.clients) {
    //client.test = Math.floor(Math.random() * 100);
  }
  //}
}, 10000);

(async () => {
  //sleep 100
  await new Promise((resolve, reject) => setTimeout(resolve, 1000));
  for (address of clients) {
    shared._rel.addTcpClient(address);
  }
})();
