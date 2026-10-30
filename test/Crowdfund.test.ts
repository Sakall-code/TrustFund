import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { Crowdfund, Crowdfund__factory, Attacker, Attacker__factory } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Crowdfund", function () {
  let crowdfund: Crowdfund;
  let owner: HardhatEthersSigner;
  let backer1: HardhatEthersSigner;
  let backer2: HardhatEthersSigner;
  
  const GOAL = ethers.parseEther("10");

  beforeEach(async function () {
    [owner, backer1, backer2] = await ethers.getSigners();
    const CrowdfundFactory = await ethers.getContractFactory("Crowdfund") as Crowdfund__factory;
    crowdfund = await CrowdfundFactory.deploy();
    await crowdfund.waitForDeployment();
  });

  // Helper to create a campaign
  async function createCampaign(goal = GOAL, duration = 3600 * 2) {
    const deadline = (await time.latest()) + duration;
    await crowdfund.connect(owner).createCampaign(goal, deadline, "QmTest123");
    return { id: 1n, deadline };
  }

  it("1. create campaign stores correct values and increments campaignCount", async function () {
    const deadline = (await time.latest()) + 3600 * 2;
    await expect(crowdfund.connect(owner).createCampaign(GOAL, deadline, "QmTest"))
      .to.emit(crowdfund, "CampaignCreated")
      .withArgs(1n, owner.address, GOAL, deadline, "QmTest");

    expect(await crowdfund.campaignCount()).to.equal(1n);
    const campaign = await crowdfund.getCampaign(1n);
    expect(campaign[0]).to.equal(owner.address);
    expect(campaign[1]).to.equal(GOAL);
    expect(campaign[2]).to.equal(deadline);
    expect(campaign[3]).to.equal(0n);
    expect(campaign[4]).to.be.false;
    expect(campaign[5]).to.equal("QmTest");
  });

  it("2. donate increases raised and the backer's contribution mapping", async function () {
    const { id } = await createCampaign();
    const amount = ethers.parseEther("1");
    
    await expect(crowdfund.connect(backer1).donate(id, { value: amount }))
      .to.emit(crowdfund, "Donated")
      .withArgs(id, backer1.address, amount);

    const campaign = await crowdfund.getCampaign(id);
    expect(campaign[3]).to.equal(amount);
    
    const contribution = await crowdfund.contributions(id, backer1.address);
    expect(contribution).to.equal(amount);
  });

  it("3. donate after deadline reverts", async function () {
    const { id, deadline } = await createCampaign();
    await time.increaseTo(deadline + 1);

    await expect(crowdfund.connect(backer1).donate(id, { value: ethers.parseEther("1") }))
      .to.be.revertedWithCustomError(crowdfund, "CampaignEnded");
  });

  it("4. withdraw before deadline reverts", async function () {
    const { id } = await createCampaign();
    await crowdfund.connect(backer1).donate(id, { value: GOAL });

    await expect(crowdfund.connect(owner).withdraw(id))
      .to.be.revertedWithCustomError(crowdfund, "CampaignNotEnded");
  });

  it("5. withdraw when goal not met reverts", async function () {
    const { id, deadline } = await createCampaign();
    await crowdfund.connect(backer1).donate(id, { value: GOAL - 1n });
    await time.increaseTo(deadline + 1);

    await expect(crowdfund.connect(owner).withdraw(id))
      .to.be.revertedWithCustomError(crowdfund, "GoalNotMet");
  });

  it("6. withdraw by non-owner reverts", async function () {
    const { id, deadline } = await createCampaign();
    await crowdfund.connect(backer1).donate(id, { value: GOAL });
    await time.increaseTo(deadline + 1);

    await expect(crowdfund.connect(backer1).withdraw(id))
      .to.be.revertedWithCustomError(crowdfund, "NotOwner");
  });

  it("7. successful withdraw transfers full balance and sets claimed", async function () {
    const { id, deadline } = await createCampaign();
    await crowdfund.connect(backer1).donate(id, { value: GOAL });
    await time.increaseTo(deadline + 1);

    const initialBalance = await ethers.provider.getBalance(owner.address);
    const tx = await crowdfund.connect(owner).withdraw(id);
    const receipt = await tx.wait();
    const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

    const finalBalance = await ethers.provider.getBalance(owner.address);
    expect(finalBalance).to.equal(initialBalance + GOAL - gasUsed);

    const campaign = await crowdfund.getCampaign(id);
    expect(campaign[4]).to.be.true;
  });

  it("8. second withdraw reverts", async function () {
    const { id, deadline } = await createCampaign();
    await crowdfund.connect(backer1).donate(id, { value: GOAL });
    await time.increaseTo(deadline + 1);

    await crowdfund.connect(owner).withdraw(id);
    await expect(crowdfund.connect(owner).withdraw(id))
      .to.be.revertedWithCustomError(crowdfund, "AlreadyClaimed");
  });

  it("9. claimRefund when goal met reverts", async function () {
    const { id, deadline } = await createCampaign();
    await crowdfund.connect(backer1).donate(id, { value: GOAL });
    await time.increaseTo(deadline + 1);

    await expect(crowdfund.connect(backer1).claimRefund(id))
      .to.be.revertedWithCustomError(crowdfund, "GoalMet");
  });

  it("10. claimRefund when goal failed returns exact contributed amount", async function () {
    const { id, deadline } = await createCampaign();
    const amount = GOAL - 1n;
    await crowdfund.connect(backer1).donate(id, { value: amount });
    await time.increaseTo(deadline + 1);

    const initialBalance = await ethers.provider.getBalance(backer1.address);
    const tx = await crowdfund.connect(backer1).claimRefund(id);
    const receipt = await tx.wait();
    const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

    const finalBalance = await ethers.provider.getBalance(backer1.address);
    expect(finalBalance).to.equal(initialBalance + amount - gasUsed);
    
    const contribution = await crowdfund.contributions(id, backer1.address);
    expect(contribution).to.equal(0n);
  });

  it("11. second claimRefund by the same backer reverts", async function () {
    const { id, deadline } = await createCampaign();
    await crowdfund.connect(backer1).donate(id, { value: GOAL - 1n });
    await time.increaseTo(deadline + 1);

    await crowdfund.connect(backer1).claimRefund(id);
    await expect(crowdfund.connect(backer1).claimRefund(id))
      .to.be.revertedWithCustomError(crowdfund, "NoContribution");
  });

  it("12. a malicious reentrant contract cannot drain funds", async function () {
    const AttackerFactory = await ethers.getContractFactory("Attacker") as Attacker__factory;
    const attackerContract = await AttackerFactory.deploy(await crowdfund.getAddress());
    await attackerContract.waitForDeployment();

    const { id, deadline } = await createCampaign();
    const amount = ethers.parseEther("1");
    
    // Attacker donates 1 ETH
    await attackerContract.attackDonate(id, { value: amount });
    
    // Honest backer donates 1 ETH
    await crowdfund.connect(backer1).donate(id, { value: amount });
    
    await time.increaseTo(deadline + 1);
    
    // Goal is not met (2 ETH < 10 ETH), so attacker tries to claim refund and reenter
    // The ReentrancyGuard should revert the transaction
    await expect(attackerContract.attackRefund(id)).to.be.reverted;
  });
});
