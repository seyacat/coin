//ts-check

const { convertBase } = require("./baseConverter");
const { sha256 } = require("./cryptoUtils");

class BinTree {
  data = {};
  constructor(dataArray) {
    const fromBase = 62;
    const toBase = 2;

    this.data = this.bintreeFromBinString(
      dataArray
        .map((data) => {
          const value = JSON.parse(data);
          return {
            data,
            key: value.address,
            binKey: convertBase(value.address, fromBase, toBase),
            value,
          };
        })
        .sort(function (a, b) {
          return b.binKey.localeCompare(a.binKey);
        })
    );
  }
  toString() {
    return JSON.stringify(this.data);
  }

  find(addr, bt = this.data, deep = 0) {
    console.log({ deep });
    //LET ONLY MASK PASS
    if (!(this.and(bt.b, addr, 62) === addr)) {
      console.log("fail mask");
      return null;
    }
    console.log("and", this.and(bt.h, addr, 62));
    if (JSON.parse(bt.data).address == addr) {
      return { data: bt.data };
    } else {
      if (bt.l && bt.r) {
        return (
          this.find(addr, bt.l, deep + 1) ?? this.find(addr, bt.r, deep + 1)
        );
      }
      if (bt.l) {
        return this.find(addr, bt.l, deep + 1);
      }
      if (bt.r) {
        return this.find(addr, bt.r, deep + 1);
      }
      return null;
    }
  }

  bintreeFromBinString = (data, offset = 0) => {
    if (!data.length || data[0].length <= offset) {
      return null;
    }
    const firstBinkey = data[0].binKey;
    if (firstBinkey[offset] == "1") {
      const left = [];
      const right = [];
      let bitmask = firstBinkey;
      for (let i = 1; i < data.length; i++) {
        const binKey = data[i].binKey;
        bitmask = this.or(bitmask, binKey);
        if (binKey[offset] == "1") {
          left.push(data[i]);
        } else {
          right.push(data[i]);
        }
      }

      const leftBranch = this.bintreeFromBinString(left, offset + 1);
      const rightBranch = this.bintreeFromBinString(right, offset + 1);

      const ret = {
        //bb: bitmask,
        //binKey: data[0].binKey,
        //key: data[0].key,
        data: data[0].data,
        b: convertBase(bitmask, 2, 62),
        //l: bintree(left, offset + 1),
        //r: bintree(right, offset + 1),
      };

      if (leftBranch) {
        ret.l = leftBranch;
      }
      if (rightBranch) {
        ret.r = rightBranch;
      }

      ret.h = convertBase(
        sha256(data[0].data + ret.l?.data ?? "" + ret.r?.data ?? "").slice(
          0,
          32
        ),
        16,
        62
      );

      //leftBranch || rightBranch ? (ret.b = convertBase(bitmask, 2, 62)) : null;

      return Object.freeze(ret);
    } else {
      return Object.freeze(this.bintreeFromBinString(data, offset + 1));
    }
  };

  and(a, b, fromBase = 2) {
    if (fromBase != 2) {
      a = convertBase(a, fromBase, 2);
      b = convertBase(b, fromBase, 2);
    }

    var out = "";
    while (a.length != b.length) {
      if (a.length < b.length) {
        a = "0" + a;
      } else {
        b = "0" + b;
      }
    }

    for (var i = 0; i < Math.max(a.length, b.length); i++) {
      if (a[i] == "1" && b[i] == "1") {
        out += "1";
      } else {
        out += "0";
      }
    }
    if (fromBase != 2) {
      return convertBase(out, 2, fromBase);
    }
    return out;
  }
  or(a, b, fromBase = 2) {
    if (fromBase != 2) {
      a = convertBase(a, fromBase, 2);
      b = convertBase(b, fromBase, 2);
    }
    var out = "";
    while (a.length != b.length) {
      if (a.length < b.length) {
        a = "0" + a;
      } else {
        b = "0" + b;
      }
    }
    for (var i = 0; i < Math.max(a.length, b.length); i++) {
      if (a[i] == "1" || b[i] == "1") {
        out += "1";
      } else {
        out += "0";
      }
    }
    if (fromBase != 2) {
      return convertBase(out, 2, fromBase);
    }
    return out;
  }
}

module.exports = { BinTree };
