//ts-check

const { convertBase } = require("./baseConverter");
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
      .map((n) => convertBase(n, fromBase, toBase))
      .sort(function (a, b) {
        return a.localeCompare(b);
      })
  );
};
const bintreeFromBinString = (data, offset = 0) => {
  if (!data.length || data[0].length <= offset) {
    return null;
  }

  if (data[0][offset] == "1") {
    const left = [];
    const right = [];
    let bitmask = data[0];
    for (let i = 1; i < data.length; i++) {
      bitmask = or(bitmask, data[i]);
      if (data[i][offset] == "1") {
        left.push(data[i]);
      } else {
        right.push(data[i]);
      }
    }
    const ret = {
      //b: bitmask,
      n: convertBase(data[0], 2, 62),
      //l: bintree(left, offset + 1),
      //r: bintree(right, offset + 1),
    };
    left && bintreeFromBinString(left, offset + 1)
      ? (ret.l = bintreeFromBinString(left, offset + 1))
      : null;
    right && bintreeFromBinString(right, offset + 1)
      ? (ret.r = bintreeFromBinString(right, offset + 1))
      : null;
    left || right ? (ret.b = convertBase(bitmask, 2, 62)) : null;
    return ret;
  } else {
    return bintreeFromBinString(data, offset + 1);
  }
};

module.exports = { and, or, bintree };
