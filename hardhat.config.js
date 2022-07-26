require("@nomiclabs/hardhat-waffle");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  // settings: {
  //   optimizer: {
  //     enabled: true,
  //     runs: 200
  //   }
  // },
  paths: {
    artifacts: './src/artifacts',
  },
  networks: {
    hardhat: {
      chainId: 1337,
      // throwOnTransactionFailures: true,
      // throwOnCallFailures: true,
      // allowUnlimitedContractSize: true,
      // blockGasLimit: 0x1fffffffffffff,
    },
    ropsten: {
      url: "https://ropsten.infura.io/v3/1c8a8be0e0eb433c8891874a8b2e7b0a",
      accounts: [`0xf1ec7a769c4367d2d22d9370e061f6d7f3b5863c4888ae643deb9c9b630bbcf4`]
    }
  }
};
