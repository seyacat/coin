const express = require("express");
//http server

var { Reactivate, Reactive } = require("@seyacat/reactive");

function ExpressShared(options = { port: null, validations: null }) {
  let reactive;
  //SERVER
  reactive = Reactivate(new ExpressSharedClass(options), {});
  return reactive;
}
class ExpressSharedClass {
  constructor(options = { port: null, validations: null }) {
    this.options = options;
    this.app = express();
    this.port = port ?? 3000;
    app.listen(port, () => {
      console.log(
        `Express server listening for connection requests on socket ${port}`
      );
    });

    app.get(
      "*",
      function (req, res) {
        if (this.shared.options.validations) {
          const localPath = data.path.join(".");
          if (!this.shared.options.validations[localPath]?.validate(data)) {
            sender.write(
              JSON.stringify({ error: `${data.path} rejected` }) + "\n\n"
            );
            console.log({ error: `${data.path} rejected` });
            //404
            res.status(404);
            res.send("Not found");
          }
        }
        res.send("Hello World");
      }.bind(this)
    );
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
        console.log({ path: data.path });
        if (this.shared.options.validations) {
          const localPath = data.path.join(".");
          if (!this.shared.options.validations[localPath]?.validate(data)) {
            sender.write(
              JSON.stringify({ error: `${data.path} rejected` }) + "\n\n"
            );
            console.log({ error: `${data.path} rejected` });
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
    ExpressShared,
  };
}
