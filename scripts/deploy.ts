import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const factory = await ethers.getContractFactory("Crowdfund");
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  const deployTx = contract.deploymentTransaction();
  const txHash = deployTx ? deployTx.hash : "N/A";
  const receipt = deployTx ? await deployTx.wait() : null;
  const blockNumber = receipt ? receipt.blockNumber : "N/A";

  console.log(`Crowdfund deployed to: ${address}`);
  console.log(`Deployment transaction hash: ${txHash}`);
  console.log(`Deployment block number: ${blockNumber}`);

  // Write ABI to lib/abi/Crowdfund.json
  const artifactPath = path.join(__dirname, "../artifacts/contracts/Crowdfund.sol/Crowdfund.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  
  const destPath = path.join(__dirname, "../lib/abi/Crowdfund.json");
  fs.writeFileSync(destPath, JSON.stringify(artifact.abi, null, 2));
  console.log(`ABI written to ${destPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
