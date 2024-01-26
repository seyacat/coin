//execute command
const execSync = require("child_process").execSync;

setInterval(() => {
  console.log(Buffer.from(execSync("git fetch")).toString());
  const ret = Buffer.from(execSync("git status")).toString();
  console.log(ret);
  if (ret.includes("Your branch is behind")) {
    console.log(Buffer.from(execSync("git pull")).toString());
  }
}, 10000);
