var { v4: uuidv4 } = require("uuid");
var { Reactivate, Reactive } = require("@seyacat/reactive");
var dgram = require("node:dgram");

function Shared(
  options = { port: null, server: null, url: null, clienPaths: null }
) {
  let reactive;

  //SERVER
  reactive = Reactivate(new SharedClass(options), {
    server: Reactive(null, { prefix: "server" }),
    clients: Reactive(null, { prefix: "clients" }),
  });
  reactive.server.subscribe(
    null,
    (data) => {
      //TODO DELETE DISCONNECTED CLIENTS
      for (let [key, client] of reactive.clients) {
        //DELETE DISNONNECTED
        if (client._rel.readyState > 1) {
          delete reactive.clients[key];
          continue;
        }
        //SEND CHANGE

        const msg = JSON.stringify({
          ...data,
          path: ["server", ...data.path],
          base: null,
          pathValues: null,
          value: data.value,
          address: options.address,
          port: options.port,
        });

        client._rel.write(msg + "\n\n");
      }
    },
    { detailed: true }
  );
  reactive.clients.subscribe(
    null,
    (data) => {
      //STOP MUTTED EVENTS
      if (reactive._rel.mutted.has(["clients", ...data.path].join("."))) {
        return;
      }
      if (data.path.length <= 1) return;
      const client = reactive.clients[data.path.slice(0, 1)];
      //DELETE DISNONNECTED
      if (client._rel.readyState > 1) {
        delete reactive.clients[data.path.slice(0, 1)];
      }
      const msg = JSON.stringify({
        //...data,
        pathIds: [client._obId, ...data.pathIds.slice(1)],
        path: ["client", ...data.path.slice(1)],
        base: null,
        pathValues: null,
        value: data.value,
        address: options.address,
        port: options.port,
      });

      client._rel.write(msg + "\n\n");
    },
    { detailed: true }
  );

  return reactive;
}
class SharedClass {
  constructor(
    options = { port: null, server: null, url: null, clienPaths: null }
  ) {
    this.mutted = new Set();
    this.options = { ...{ port: 12556, server: null }, ...options };

    //SERVER
    this.options.server.on(
      "connection",
      function (socket) {
        console.log("Connected");
        socket.on(
          "data",
          this.onmessage.bind({ shared: this, socket: socket })
        );
      }.bind(this)
    );
  }

  addTcpClient(tcpClient) {
    tcpClient.connect(client.port, client.host, function () {
      console.log("Connected");
      //tcpclient.write("Hello From Client " + tcpclient.address().address);
    });
    this.reactive.clients[`${client.host}:${client.port}`] =
      Reactivate(tcpClient);
    tcpClient.on(
      "data",
      this.onmessage.bind({ shared: this, socket: tcpClient })
    );
  }

  onmessage = async function (buff) {
    let sender = this.socket;
    let uuid = `${this.socket.remoteAddress}:${this.socket.remotePort}`;
    let data;

    const payload = Buffer.from(buff).toString();
    for (const msg of payload.split("\n\n")) {
      if (!msg) continue;

      try {
        data = JSON.parse(msg);
      } catch (e) {
        console.log("error", msg, e);
        continue;
      }

      //CREATE REACTIVES
      if (!this.shared.reactive.clients[uuid]) {
        this.shared.reactive.clients[uuid] = Reactivate(
          sender,
          {},
          { prefix: uuid }
        );
        //this.shared.reactive.clients[uuid].triggerChange();
      }

      if (Array.isArray(data.path)) {
        //CHECK CLIENT PATHS

        if (this.shared.options.clientPaths) {
          const localPath = data.path.join(".");
          if (
            !this.shared.options.clientPaths[localPath]?.validate(data.value)
          ) {
            sender.write(
              JSON.stringify({ error: `${data.path} rejected` }) + "\n\n"
            );
            console.log({ error: `${data.path} rejected` });
            continue;
          }
        }
        const path = ["clients", uuid, ...data.path];
        this.shared.mutted.add(path.join("."));
        let r = this.shared.reactive;
        for (let step of path.slice(0, -1)) {
          if (!r[step]) {
            r[step] = Reactive();
          }
          r = r[step];
        }
        r[path.slice(-1)] = data.value;
        this.shared.mutted.delete(path.join("."));
      }
    }
  };
}

const createChainFromDetailed = (base, prop, detailed) => {
  if (detailed?._obId) {
    base[prop] = Reactive({}, { obId: detailed?._obId, const: true });
    for (nextprop in detailed.value) {
      createChainFromDetailed(base[prop], nextprop, detailed.value[nextprop]);
    }
  } else {
    base[prop] = detailed;
  }
};

if (typeof module !== "undefined") {
  module.exports = {
    Shared,
  };
}
