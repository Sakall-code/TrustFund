import { ethers } from "hardhat";
import { CONTRACT_ADDRESS } from "../lib/constants";

async function main() {
  const [alice, bob, charlie] = await ethers.getSigners();
  const crowdfund = await ethers.getContractAt("Crowdfund", CONTRACT_ADDRESS);

  const block = await ethers.provider.getBlock("latest");
  const currentTimestamp = block ? block.timestamp : Math.floor(Date.now() / 1000);
  const deadline14Days = currentTimestamp + 14 * 86400;

  console.log(`Seeding campaigns on Crowdfund at: ${CONTRACT_ADDRESS}...`);
  const currentCount = await crowdfund.campaignCount();
  console.log(`Current on-chain campaignCount: ${currentCount}`);

  if (Number(currentCount) === 0) {
    // 1. "rgwefwf"
    console.log("Creating Campaign 1: rgwefwf...");
    let tx = await crowdfund.connect(alice).createCampaign(
      ethers.parseEther("10"),
      deadline14Days,
      "QmQFSWxmyDGTzc8j2NfRCFLnPtMUfDYAKfUGM934GaMZTK"
    );
    await tx.wait();

    // Bob donates 10 ETH to Campaign 1 (Goal met!)
    tx = await crowdfund.connect(bob).donate(1, { value: ethers.parseEther("10") });
    await tx.wait();
    console.log("  -> Bob donated 10 ETH to Campaign 1");

    // 2. "Washroom Renovations in Rural Schools"
    console.log("Creating Campaign 2: Washroom Renovations...");
    tx = await crowdfund.connect(alice).createCampaign(
      ethers.parseEther("50"),
      deadline14Days,
      "QmedoAR96YtUfyzEUGwx28rXamnTDkS6SNYU9eMYQwEtQU"
    );
    await tx.wait();

    // Charlie donates 5 ETH to Campaign 2
    tx = await crowdfund.connect(charlie).donate(2, { value: ethers.parseEther("5") });
    await tx.wait();
    console.log("  -> Charlie donated 5 ETH to Campaign 2");

    // 3. "dsfvcds"
    console.log("Creating Campaign 3: dsfvcds...");
    tx = await crowdfund.connect(alice).createCampaign(
      ethers.parseEther("100"),
      deadline14Days,
      "QmekvGKsDU1ZakesTamhALMooWyeAqubuDcNFZwtPJVbuR"
    );
    await tx.wait();

    // Bob donates 25 ETH to Campaign 3
    tx = await crowdfund.connect(bob).donate(3, { value: ethers.parseEther("25") });
    await tx.wait();
    console.log("  -> Bob donated 25 ETH to Campaign 3");

    // 4. Placeholder for ID 4
    console.log("Creating Campaign 4 (Placeholder)...");
    tx = await crowdfund.connect(alice).createCampaign(
      ethers.parseEther("20"),
      deadline14Days,
      "QmPlaceholderCidForId4"
    );
    await tx.wait();

    // 5. "DFGEDRD"
    console.log("Creating Campaign 5: DFGEDRD...");
    tx = await crowdfund.connect(alice).createCampaign(
      ethers.parseEther("10"),
      deadline14Days,
      "Qmas7aFjFjDftuXihQsbLFp82o3xCW52Pm5A9RbB71EsN8"
    );
    await tx.wait();

    const newCount = await crowdfund.campaignCount();
    console.log(`Seeding complete! On-chain campaignCount is now: ${newCount}`);
  } else {
    console.log(`Smart contract already has ${currentCount} campaigns. No seeding needed.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
