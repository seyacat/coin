const Net = require("net");

var { Reactivate, Reactive } = require("@seyacat/reactive");

function Shared(options = { port: null, validations: null }) {
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
        const address = key;
        const port = reactive._rel.options.port;
        const msg = JSON.stringify({
          ...data,
          path: [...data.path],
          base: null,
          pathValues: null,
          value: data.value,
        });

        const tcpClient = new Net.Socket();

        tcpClient.connect(port, address, function () {
          tcpClient.write(msg + "\n\n");
        });
        tcpClient.on("data", function (data) {
          //console.log({ response: data.toString() });
          //TODO HANDLE RESPONSE
          tcpClient.destroy();
        });
        tcpClient.on("error", function (error) {
          //TODO REMOVE CLIENT ON ERROR
          console.log("handled error", error.message);
        });
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
      const key = data.path[0];
      const address = key;
      const port = reactive._rel.options.port;
      const client = reactive.clients[data.path.slice(0, 1)];
      //DELETE DISNONNECTED
      const msg = JSON.stringify({
        //...data,
        pathIds: [...data.pathIds.slice(1)],
        path: [...data.path.slice(1)],
        base: null,
        pathValues: null,
        value: data.value,
      });

      const tcpClient = new Net.Socket();

      tcpClient.connect(port, address, function () {
        tcpClient.write(msg + "\n\n");
      });
      tcpClient.on("data", function (data) {
        //console.log({ response: data.toString() });
        //TODO HANDLE RESPONSE
        tcpClient.destroy();
      });
      tcpClient.on("error", function (error) {
        //TODO REMOVE CLIENT ON ERROR
        console.log("handled error", error.message);
      });
    },
    { detailed: true }
  );

  return reactive;
}
class SharedClass {
  constructor(options = { port: null, validations: null }) {
    this.mutted = new Set();
    this.options = { ...{ port: null, server: null }, ...options };

    this.server = new Net.Server();
    this.server.listen(
      this.options.port,
      function () {
        console.log(
          `Server listening for connection requests on socket localhost:${this.options.port}`
        );
      }.bind(this)
    );

    //SERVER
    this.server.on(
      "connection",
      function (socket) {
        socket.on(
          "data",
          this.onmessage.bind({ shared: this, socket: socket })
        );
      }.bind(this)
    );
  }

  addTcpClient(address) {
    this.reactive.clients[`${address}`] = Reactive({});
  }

  onmessage = async function (buff) {
    let sender = this.socket;
    const port = this.shared.options.port;
    const address = this.socket.remoteAddress.split(":").slice(-1)[0];
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

      let uuid = `${address}`;

      //CREATE REACTIVES
      if (!this.shared.reactive.clients[uuid]) {
        this.shared.reactive.clients[uuid] = Reactive({}, { prefix: uuid });
        //this.shared.reactive.clients[uuid].triggerChange();
      }

      if (Array.isArray(data.path)) {
        //CHECK CLIENT PATHS
        if (this.shared.options.validations) {
          const localPath = data.path.join(".");
          if (!this.shared.options.validations[localPath]?.validate(data)) {
            sender.write(
              JSON.stringify({ error: `${data.path} rejected` }) + "\n\n"
            );
            continue;
          }
        }
        //TODO SEND VALID RESPONSE

        sender.write(JSON.stringify({ ok: true }) + "\n\n");
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
