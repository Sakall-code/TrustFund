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
    // Flagship Demo Campaign: "Community Food Drive — 100 Meals"
    console.log("Creating Flagship Campaign 1: Community Food Drive — 100 Meals...");
    const softCaps = [
      ethers.parseEther("20"),
      ethers.parseEther("50"),
      ethers.parseEther("100"),
    ];
    let tx = await crowdfund.connect(alice)["createCampaign(uint256,uint256,string,uint256[])"](
      ethers.parseEther("100"),
      deadline14Days,
      "QmCommunityFoodDriveCid001",
      softCaps
    );
    await tx.wait();

    // Bob donates 35 ETH (Soft Cap 1 reached at 20 ETH, 15 ETH towards Soft Cap 2)
    tx = await crowdfund.connect(bob).donate(1, { value: ethers.parseEther("35") });
    await tx.wait();
    console.log("  -> Bob donated 35 ETH to Flagship Campaign 1 (Soft Cap 1 at 20 ETH unlocked!)");

    // 2. "Solar Lamps for Rural Schools"
    console.log("Creating Campaign 2: Solar Lamps for Rural Schools...");
    tx = await crowdfund.connect(alice)["createCampaign(uint256,uint256,string,uint256[])"](
      ethers.parseEther("50"),
      deadline14Days,
      "QmSolarLampsPlaceholder0001",
      [ethers.parseEther("20"), ethers.parseEther("50")]
    );
    await tx.wait();

    // Bob donates 50 ETH to Campaign 2 (Goal met!)
    tx = await crowdfund.connect(bob).donate(2, { value: ethers.parseEther("50") });
    await tx.wait();
    console.log("  -> Bob donated 50 ETH to Campaign 2 (Goal met!)");

    // 3. "Washroom Renovations in Rural Schools"
    console.log("Creating Campaign 3: Washroom Renovations...");
    tx = await crowdfund.connect(alice)["createCampaign(uint256,uint256,string)"](
      ethers.parseEther("50"),
      deadline14Days,
      "QmedoAR96YtUfyzEUGwx28rXamnTDkS6SNYU9eMYQwEtQU"
    );
    await tx.wait();

    // Charlie donates 5 ETH to Campaign 3
    tx = await crowdfund.connect(charlie).donate(3, { value: ethers.parseEther("5") });
    await tx.wait();
    console.log("  -> Charlie donated 5 ETH to Campaign 3");

    // 4. "dsfvcds"
    console.log("Creating Campaign 4: dsfvcds...");
    tx = await crowdfund.connect(alice)["createCampaign(uint256,uint256,string)"](
      ethers.parseEther("100"),
      deadline14Days,
      "QmekvGKsDU1ZakesTamhALMooWyeAqubuDcNFZwtPJVbuR"
    );
    await tx.wait();

    // Bob donates 25 ETH to Campaign 4
    tx = await crowdfund.connect(bob).donate(4, { value: ethers.parseEther("25") });
    await tx.wait();
    console.log("  -> Bob donated 25 ETH to Campaign 4");

    // 5. "DFGEDRD"
    console.log("Creating Campaign 5: DFGEDRD...");
    tx = await crowdfund.connect(alice)["createCampaign(uint256,uint256,string)"](
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
