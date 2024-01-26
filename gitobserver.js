//execute command
const execSync = require("child_process").execSync;

setInterval(() => {
  execSync("git fetch");
  const ret = Buffer.from(execSync("git status")).toString();
  if (ret.includes("Your branch is behind")) {
    execSync("git pull");
  }
}, 10000);
