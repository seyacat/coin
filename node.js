const { Shared } = require("./tcpshared.js");

const argv = require("minimist")(process.argv.slice(2));

console.log({ argv });
clients =
  argv.port == 12345
    ? [{ address: "127.0.0.1", port: "12346" }]
    : [{ address: "127.0.0.1", port: "12345" }];

const shared = Shared({
  port: argv.port,
  //clientPaths: { message: { validate: (val) => typeof val === "string" } },
});

shared.subscribe(null, (data) => {
  console.log(data.path, data.value);
});

setInterval(() => {
  //if (argv.port == 12345) {
  //shared.server.hola = Math.floor(Math.random() * 100);
  //console.log("CLIETNS", Object.keys(shared.clients._));

  for (const [key, client] of shared.clients) {
    client.test = Math.floor(Math.random() * 100);
  }
  //}
}, 10000);

(async () => {
  //sleep 100
  await new Promise((resolve, reject) => setTimeout(resolve, 1000));
  for (client of clients) {
    shared._rel.addTcpClient(client);
  }
})();
