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
    await crowdfund.connect(owner)["createCampaign(uint256,uint256,string)"](goal, deadline, "QmTest123");
    return { id: 1n, deadline };
  }

  it("1. create campaign stores correct values and increments campaignCount", async function () {
    const deadline = (await time.latest()) + 3600 * 2;
    await expect(crowdfund.connect(owner)["createCampaign(uint256,uint256,string)"](GOAL, deadline, "QmTest"))
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
    expect(campaign[6]).to.equal(0n); // withdrawn
    expect(campaign[7]).to.equal(0n); // unlocked
    expect(campaign[8]).to.deep.equal([GOAL]); // default softCaps
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

  it("4. withdraw when no soft cap met reverts (even before deadline)", async function () {
    const { id } = await createCampaign();
    // Donating less than GOAL (softCaps[0]) leaves unlocked == 0
    await crowdfund.connect(backer1).donate(id, { value: GOAL - 1n });

    await expect(crowdfund.connect(owner).withdraw(id))
      .to.be.revertedWithCustomError(crowdfund, "GoalNotMet");
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
    expect(campaign[4]).to.be.true; // claimed
    expect(campaign[6]).to.equal(GOAL); // withdrawn
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

  describe("v2 Milestone Escrow & Pro-Rata Overflow Refunds", function () {
    const CAMPAIGN_GOAL = ethers.parseEther("100");
    const SOFT_CAPS = [ethers.parseEther("20"), ethers.parseEther("50"), ethers.parseEther("100")];

    async function createMilestoneCampaign(duration = 86400 * 10) {
      const deadline = (await time.latest()) + duration;
      await crowdfund.connect(owner)["createCampaign(uint256,uint256,string,uint256[])"](
        CAMPAIGN_GOAL,
        deadline,
        "QmMilestone123",
        SOFT_CAPS
      );
      const id = await crowdfund.campaignCount();
      return { id, deadline };
    }

    it("softCaps validation: rejects zero, unordered, or descending caps, auto-appends goal", async function () {
      const deadline = (await time.latest()) + 86400 * 2;
      // 0 cap
      await expect(
        crowdfund.connect(owner)["createCampaign(uint256,uint256,string,uint256[])"](
          CAMPAIGN_GOAL,
          deadline,
          "Qm1",
          [0n, ethers.parseEther("50")]
        )
      ).to.be.revertedWithCustomError(crowdfund, "InvalidSoftCaps");

      // Descending caps
      await expect(
        crowdfund.connect(owner)["createCampaign(uint256,uint256,string,uint256[])"](
          CAMPAIGN_GOAL,
          deadline,
          "Qm1",
          [ethers.parseEther("50"), ethers.parseEther("20")]
        )
      ).to.be.revertedWithCustomError(crowdfund, "InvalidSoftCaps");

      // Intermediate cap exceeding goal
      await expect(
        crowdfund.connect(owner)["createCampaign(uint256,uint256,string,uint256[])"](
          CAMPAIGN_GOAL,
          deadline,
          "Qm1",
          [ethers.parseEther("20"), ethers.parseEther("120")]
        )
      ).to.be.revertedWithCustomError(crowdfund, "InvalidSoftCaps");

      // Valid intermediate caps without goal: auto-appends goal
      await crowdfund.connect(owner)["createCampaign(uint256,uint256,string,uint256[])"](
        CAMPAIGN_GOAL,
        deadline,
        "QmAutoAppend",
        [ethers.parseEther("20"), ethers.parseEther("50")]
      );
      const id = await crowdfund.campaignCount();
      const caps = await crowdfund.getSoftCaps(id);
      expect(caps).to.deep.equal(SOFT_CAPS);
    });

    it("a) Immediate pre-deadline withdrawal when Soft Cap 1 (20 ETH) is reached on Day 3", async function () {
      const { id } = await createMilestoneCampaign();

      // Day 3
      await time.increase(3 * 86400);

      // Backer1 donates 20 ETH (reaches Soft Cap 1)
      await crowdfund.connect(backer1).donate(id, { value: ethers.parseEther("20") });

      expect(await crowdfund.getUnlockedAmount(id)).to.equal(ethers.parseEther("20"));

      // Creator withdraws Soft Cap 1 BEFORE deadline
      const initialBal = await ethers.provider.getBalance(owner.address);
      const tx = await crowdfund.connect(owner).withdraw(id);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const finalBal = await ethers.provider.getBalance(owner.address);

      expect(finalBal).to.equal(initialBal + ethers.parseEther("20") - gasUsed);

      const campaign = await crowdfund.getCampaign(id);
      expect(campaign[6]).to.equal(ethers.parseEther("20")); // withdrawn
      expect(campaign[7]).to.equal(ethers.parseEther("20")); // unlocked
      expect(campaign[4]).to.be.false; // claimed is false because goal (100) not reached
    });

    it("b) Second tranche withdrawal (30 ETH delta) when Soft Cap 2 (50 ETH) is reached on Day 5", async function () {
      const { id } = await createMilestoneCampaign();

      // Day 3: reach Cap 1 (20 ETH) and withdraw
      await time.increase(3 * 86400);
      await crowdfund.connect(backer1).donate(id, { value: ethers.parseEther("20") });
      await crowdfund.connect(owner).withdraw(id);

      // Day 5: backer2 donates 30 ETH (total raised reaches 50 ETH = Soft Cap 2)
      await time.increase(2 * 86400);
      await crowdfund.connect(backer2).donate(id, { value: ethers.parseEther("30") });

      expect(await crowdfund.getUnlockedAmount(id)).to.equal(ethers.parseEther("50"));

      // Creator withdraws second tranche (50 - 20 = 30 ETH) BEFORE deadline
      const initialBal = await ethers.provider.getBalance(owner.address);
      const tx = await crowdfund.connect(owner).withdraw(id);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const finalBal = await ethers.provider.getBalance(owner.address);

      expect(finalBal).to.equal(initialBal + ethers.parseEther("30") - gasUsed);

      const campaign = await crowdfund.getCampaign(id);
      expect(campaign[6]).to.equal(ethers.parseEther("50")); // withdrawn total = 50 ETH
      expect(campaign[7]).to.equal(ethers.parseEther("50")); // unlocked = 50 ETH
      expect(campaign[4]).to.be.false;
    });

    it("c) Blocking further creator withdrawal when raised = 40 ETH (between 20 and 50 caps) both before and after deadline", async function () {
      const { id, deadline } = await createMilestoneCampaign();

      // Donate 40 ETH: unlocks 20 ETH (Cap 1)
      await crowdfund.connect(backer1).donate(id, { value: ethers.parseEther("40") });
      expect(await crowdfund.getUnlockedAmount(id)).to.equal(ethers.parseEther("20"));

      // Creator withdraws 20 ETH
      await crowdfund.connect(owner).withdraw(id);

      // Attempting to withdraw again BEFORE deadline reverts (already claimed unlocked amount)
      await expect(crowdfund.connect(owner).withdraw(id))
        .to.be.revertedWithCustomError(crowdfund, "AlreadyClaimed");

      // Advance past deadline
      await time.increaseTo(deadline + 1);

      // Attempting to withdraw again AFTER deadline still reverts
      await expect(crowdfund.connect(owner).withdraw(id))
        .to.be.revertedWithCustomError(crowdfund, "AlreadyClaimed");
    });

    it("d) Post-deadline Pro-Rata Overflow Refund when raised = 40 ETH (unlocked = 20 ETH, overflow = 20 ETH): Bob (30 ETH) receives 15 ETH, Charlie (10 ETH) receives 5 ETH, Alice withdraws 20 ETH", async function () {
      const { id, deadline } = await createMilestoneCampaign();

      // Bob (backer1) donates 30 ETH
      await crowdfund.connect(backer1).donate(id, { value: ethers.parseEther("30") });
      // Charlie (backer2) donates 10 ETH
      await crowdfund.connect(backer2).donate(id, { value: ethers.parseEther("10") });

      // Total raised = 40 ETH, unlocked = 20 ETH, overflow = 20 ETH
      expect(await crowdfund.getUnlockedAmount(id)).to.equal(ethers.parseEther("20"));

      // Refund before deadline reverts
      await expect(crowdfund.connect(backer1).claimRefund(id))
        .to.be.revertedWithCustomError(crowdfund, "CampaignNotEnded");

      // Advance past deadline
      await time.increaseTo(deadline + 1);

      // Query view function getRefundableAmount
      expect(await crowdfund.getRefundableAmount(id, backer1.address)).to.equal(ethers.parseEther("15"));
      expect(await crowdfund.getRefundableAmount(id, backer2.address)).to.equal(ethers.parseEther("5"));

      // Alice (owner) withdraws her 20 ETH unlocked tranche
      const alicePreBal = await ethers.provider.getBalance(owner.address);
      const aliceTx = await crowdfund.connect(owner).withdraw(id);
      const aliceReceipt = await aliceTx.wait();
      const aliceGas = aliceReceipt!.gasUsed * aliceReceipt!.gasPrice;
      const alicePostBal = await ethers.provider.getBalance(owner.address);
      expect(alicePostBal).to.equal(alicePreBal + ethers.parseEther("20") - aliceGas);

      // Bob (backer1) claims refund: (30 * 20) / 40 = 15 ETH
      const bobPreBal = await ethers.provider.getBalance(backer1.address);
      const bobTx = await crowdfund.connect(backer1).claimRefund(id);
      const bobReceipt = await bobTx.wait();
      const bobGas = bobReceipt!.gasUsed * bobReceipt!.gasPrice;
      const bobPostBal = await ethers.provider.getBalance(backer1.address);
      expect(bobPostBal).to.equal(bobPreBal + ethers.parseEther("15") - bobGas);
      expect(await crowdfund.contributions(id, backer1.address)).to.equal(0n);

      // Bob cannot claim a second time
      await expect(crowdfund.connect(backer1).claimRefund(id))
        .to.be.revertedWithCustomError(crowdfund, "NoContribution");

      // Charlie (backer2) claims refund: (10 * 20) / 40 = 5 ETH
      const charliePreBal = await ethers.provider.getBalance(backer2.address);
      const charlieTx = await crowdfund.connect(backer2).claimRefund(id);
      const charlieReceipt = await charlieTx.wait();
      const charlieGas = charlieReceipt!.gasUsed * charlieReceipt!.gasPrice;
      const charliePostBal = await ethers.provider.getBalance(backer2.address);
      expect(charliePostBal).to.equal(charliePreBal + ethers.parseEther("5") - charlieGas);
      expect(await crowdfund.contributions(id, backer2.address)).to.equal(0n);

      // Contract balance for this campaign is completely drained
      const finalContractBalance = await ethers.provider.getBalance(await crowdfund.getAddress());
      expect(finalContractBalance).to.equal(0n);
    });

    it("e) Point-wise fractional Wei precision test (20 ETH and 10 ETH donations totaling 30 ETH with 20 ETH unlocked -> 6.666666666666666666 ETH and 3.333333333333333333 ETH refunds without revert)", async function () {
      const { id, deadline } = await createMilestoneCampaign();

      // Bob donates 20 ETH, Charlie donates 10 ETH -> total 30 ETH
      await crowdfund.connect(backer1).donate(id, { value: ethers.parseEther("20") });
      await crowdfund.connect(backer2).donate(id, { value: ethers.parseEther("10") });

      // Unlocked = 20 ETH, overflow = 10 ETH
      expect(await crowdfund.getUnlockedAmount(id)).to.equal(ethers.parseEther("20"));

      await time.increaseTo(deadline + 1);

      // Exact integer Wei calculation:
      // Bob refund: (20e18 * 10e18) / 30e18 = 6666666666666666666n
      // Charlie refund: (10e18 * 10e18) / 30e18 = 3333333333333333333n
      const expectedBobRefund = 6666666666666666666n;
      const expectedCharlieRefund = 3333333333333333333n;

      expect(await crowdfund.getRefundableAmount(id, backer1.address)).to.equal(expectedBobRefund);
      expect(await crowdfund.getRefundableAmount(id, backer2.address)).to.equal(expectedCharlieRefund);

      // Alice withdraws 20 ETH
      await crowdfund.connect(owner).withdraw(id);

      // Bob claims fractional refund successfully
      const bobPre = await ethers.provider.getBalance(backer1.address);
      const bobTx = await crowdfund.connect(backer1).claimRefund(id);
      const bobRcpt = await bobTx.wait();
      const bobGas = bobRcpt!.gasUsed * bobRcpt!.gasPrice;
      const bobPost = await ethers.provider.getBalance(backer1.address);
      expect(bobPost).to.equal(bobPre + expectedBobRefund - bobGas);

      // Charlie claims fractional refund successfully
      const charliePre = await ethers.provider.getBalance(backer2.address);
      const charlieTx = await crowdfund.connect(backer2).claimRefund(id);
      const charlieRcpt = await charlieTx.wait();
      const charlieGas = charlieRcpt!.gasUsed * charlieRcpt!.gasPrice;
      const charliePost = await ethers.provider.getBalance(backer2.address);
      expect(charliePost).to.equal(charliePre + expectedCharlieRefund - charlieGas);
    });
  });
});
