//ts-check
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

const bintree = (data) => {};
const bintreeFromBinString = (data, offset = 0) => {
  if (offset == 0) {
    data = homogen(data);
  }

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
      n: data[0],
      //l: bintree(left, offset + 1),
      //r: bintree(right, offset + 1),
    };
    left && bintree(left, offset + 1)
      ? (ret.l = bintree(left, offset + 1))
      : null;
    right && bintree(right, offset + 1)
      ? (ret.r = bintree(right, offset + 1))
      : null;
    left || right ? (ret.b = bitmask) : null;
    return ret;
  } else {
    return bintree(data, offset + 1);
  }
};

function homogen(data) {
  data = data.sort((a, b) => b - a).map(hex2bin);
  maxlen = data[0].length;
  console.log(data);
  data = data.map((n) => {
    while (n.length < maxlen) {
      n = "0" + n;
    }
    return n;
  });
  return data;
}

function hex2bin(hex) {
  if (typeof hex === "number") {
    hex = hex.toString(16);
  }

  hex = hex.replace("0x", "").toLowerCase();
  var out = "";

  for (var c of hex) {
    switch (c) {
      case "0":
        out += "0000";
        break;
      case "1":
        out += "0001";
        break;
      case "2":
        out += "0010";
        break;
      case "3":
        out += "0011";
        break;
      case "4":
        out += "0100";
        break;
      case "5":
        out += "0101";
        break;
      case "6":
        out += "0110";
        break;
      case "7":
        out += "0111";
        break;
      case "8":
        out += "1000";
        break;
      case "9":
        out += "1001";
        break;
      case "a":
        out += "1010";
        break;
      case "b":
        out += "1011";
        break;
      case "c":
        out += "1100";
        break;
      case "d":
        out += "1101";
        break;
      case "e":
        out += "1110";
        break;
      case "f":
        out += "1111";
        break;
      default:
        return "";
    }
  }

  return out;
}

module.exports = { and, hex2bin, or, bintree };
