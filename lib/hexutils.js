//ts-check

const { convertBase } = require("./baseConverter");
const { sha256 } = require("./cryptoUtils");
function and(a, b) {
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
  return out;
}
function or(a, b) {
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
  return out;
}

const bintree = (data, fromBase = 62, toBase = 2) => {
  return bintreeFromBinString(
    data
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
};
const bintreeFromBinString = (data, offset = 0) => {
  if (!data.length || data[0].length <= offset) {
    return null;
  }
  const firstBinkey = convertBase(data[0].key, 62, 2);
  if (firstBinkey[offset] == "1") {
    const left = [];
    const right = [];
    let bitmask = firstBinkey;
    for (let i = 1; i < data.length; i++) {
      const binKey = data[i].binKey;
      bitmask = or(bitmask, binKey);
      if (binKey[offset] == "1") {
        left.push(data[i]);
      } else {
        right.push(data[i]);
      }
    }

    const leftBranch = bintreeFromBinString(left, offset + 1);
    const rightBranch = bintreeFromBinString(right, offset + 1);

    const ret = {
      //bb: bitmask,
      //binKey: data[0].binKey,
      //key: data[0].key,
      data: data[0].data,
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
      sha256(data[0].value + ret.l?.value ?? "" + ret.r?.value ?? "").slice(
        0,
        32
      ),
      16,
      62
    );

    //leftBranch || rightBranch ? (ret.b = convertBase(bitmask, 2, 62)) : null;
    ret.b = convertBase(bitmask, 2, 62);

    return ret;
  } else {
    return bintreeFromBinString(data, offset + 1);
  }
};

module.exports = { and, or, bintree };
