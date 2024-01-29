const JSONb = require("json-bigint");
module.exports = class Blockchain {
  blockchain = [];
  constructor(options) {}

  addBlock(block) {
    this.blockchain.push(block);
    this.blockchain.sort((a, b) => a.index - b.index);
  }
  getBalance(address) {
    for (const block of this.blockchain) {
      for (const transaction of block.transactions) {
        for (const output of JSONb.parse(transaction.tx.data).outputs) {
          if (output.address === address) {
            return output.amount;
          }
        }
      }
    }
    return 0;
  }
};
