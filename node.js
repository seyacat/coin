const { Shared } = require("./tcpshared.js");
const Net = require("net");
const argv = require("minimist")(process.argv.slice(2));
const { Reactivate } = require("@seyacat/reactive");

console.log({ argv });
clients =
  argv.port == 12345
    ? [{ host: "127.0.0.1", port: "12346" }]
    : [{ host: "127.0.0.1", port: "12345" }];

const server = new Net.Server();

const shared = Shared({
  server: server,
  clientPaths: { message: { validate: (val) => typeof val === "string" } },
});

shared.subscribe(null, (data) => {
  console.log(data.path, data.value);
});

setInterval(() => {
  shared.server.hola = 10;
  console.log(Object.keys(shared.clients._));
  for (const [key, client] of shared.clients) {
    client.test = Math.floor(Math.random() * 100);
  }
}, 10000);

server.listen(argv.port, function () {
  console.log(
    `Server listening for connection requests on socket localhost:${argv.port}`
  );
});

(async () => {
  //sleep 100
  await new Promise((resolve, reject) => setTimeout(resolve, 1000));

  for (client of clients) {
    const tcpclient = new Net.Socket();
    shared._rel.addTcpClient(tcpclient);
  }
})();
