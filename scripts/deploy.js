const hre = require("hardhat");

async function main() {
  const CrowdfundingIDO = await hre.ethers.getContractFactory("CrowdfundingIDO");
  const crowdfundingIDO = await CrowdfundingIDO.deploy();
  await crowdfundingIDO.deployed();
  console.log("CrowdfundingIDO deployed to:", crowdfundingIDO.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
