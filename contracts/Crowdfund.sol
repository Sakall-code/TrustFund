// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

error InvalidGoal();
error InvalidDeadline();
error InvalidMetadata();
error CampaignDoesNotExist();
error CampaignEnded();
error InvalidDonation();
error NotOwner();
error GoalNotMet();
error CampaignNotEnded();
error AlreadyClaimed();
error GoalMet();
error NoContribution();
error TransferFailed();
error InvalidSoftCaps();
error NothingToWithdraw();
error NoRefundAvailable();

contract Crowdfund is ReentrancyGuard {
    struct Campaign {
        address owner;
        uint256 goal;
        uint256 deadline;
        uint256 raised;
        bool claimed;
        string metadataCid;
        uint256 withdrawn;
        uint256[] softCaps;
    }

    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public contributions;
    uint256 public campaignCount;

    event CampaignCreated(uint256 indexed id, address indexed owner, uint256 goal, uint256 deadline, string metadataCid);
    event Donated(uint256 indexed id, address indexed backer, uint256 amount);
    event Withdrawn(uint256 indexed id, address indexed owner, uint256 amount);
    event Refunded(uint256 indexed id, address indexed backer, uint256 amount);

    /**
     * @notice Creates a new crowdfunding campaign with default [goal] soft cap.
     * @param goal The funding goal in wei.
     * @param deadline The timestamp when the campaign ends.
     * @param metadataCid The IPFS CID for campaign metadata.
     * @return id The ID of the newly created campaign.
     */
    function createCampaign(uint256 goal, uint256 deadline, string calldata metadataCid) external returns (uint256 id) {
        uint256[] memory defaultCaps = new uint256[](1);
        defaultCaps[0] = goal;
        return _createCampaign(goal, deadline, metadataCid, defaultCaps);
    }

    /**
     * @notice Creates a new crowdfunding campaign with custom soft-cap milestones.
     * @param goal The funding goal in wei.
     * @param deadline The timestamp when the campaign ends.
     * @param metadataCid The IPFS CID for campaign metadata.
     * @param softCaps An ascending array of soft caps ending with goal.
     * @return id The ID of the newly created campaign.
     */
    function createCampaign(
        uint256 goal,
        uint256 deadline,
        string calldata metadataCid,
        uint256[] calldata softCaps
    ) external returns (uint256 id) {
        return _createCampaign(goal, deadline, metadataCid, softCaps);
    }

    function _createCampaign(
        uint256 goal,
        uint256 deadline,
        string calldata metadataCid,
        uint256[] memory softCaps
    ) internal returns (uint256 id) {
        if (goal == 0) revert InvalidGoal();
        if (deadline <= block.timestamp + 1 hours) revert InvalidDeadline();
        if (bytes(metadataCid).length == 0) revert InvalidMetadata();

        uint256[] memory finalCaps;
        if (softCaps.length == 0) {
            finalCaps = new uint256[](1);
            finalCaps[0] = goal;
        } else {
            uint256 len = softCaps.length;
            for (uint256 i = 0; i < len; i++) {
                if (softCaps[i] == 0) revert InvalidSoftCaps();
                if (i > 0 && softCaps[i] <= softCaps[i - 1]) revert InvalidSoftCaps();
            }

            if (softCaps[len - 1] == goal) {
                finalCaps = softCaps;
            } else if (softCaps[len - 1] < goal) {
                finalCaps = new uint256[](len + 1);
                for (uint256 i = 0; i < len; i++) {
                    finalCaps[i] = softCaps[i];
                }
                finalCaps[len] = goal;
            } else {
                revert InvalidSoftCaps();
            }
        }

        campaignCount++;
        id = campaignCount;

        campaigns[id] = Campaign({
            owner: msg.sender,
            goal: goal,
            deadline: deadline,
            raised: 0,
            claimed: false,
            metadataCid: metadataCid,
            withdrawn: 0,
            softCaps: finalCaps
        });

        emit CampaignCreated(id, msg.sender, goal, deadline, metadataCid);
    }

    /**
     * @notice Donates ETH to a specific campaign.
     * @param id The ID of the campaign to donate to.
     */
    function donate(uint256 id) external payable nonReentrant {
        Campaign storage campaign = campaigns[id];
        if (campaign.owner == address(0)) revert CampaignDoesNotExist();
        if (block.timestamp >= campaign.deadline) revert CampaignEnded();
        if (msg.value == 0) revert InvalidDonation();

        campaign.raised += msg.value;
        contributions[id][msg.sender] += msg.value;

        emit Donated(id, msg.sender, msg.value);
    }

    /**
     * @notice Calculates the currently unlocked funds for a campaign.
     * @param id The ID of the campaign.
     * @return unlocked The amount in wei currently unlocked.
     */
    function getUnlockedAmount(uint256 id) public view returns (uint256) {
        Campaign storage campaign = campaigns[id];
        uint256 raised = campaign.raised;
        if (raised >= campaign.goal) {
            return raised;
        }

        uint256[] storage caps = campaign.softCaps;
        uint256 len = caps.length;
        if (len == 0 || raised < caps[0]) {
            return 0;
        }

        uint256 unlocked = 0;
        for (uint256 i = 0; i < len; i++) {
            if (raised >= caps[i]) {
                unlocked = caps[i];
            } else {
                break;
            }
        }
        return unlocked;
    }

    /**
     * @notice Returns the soft caps for a given campaign.
     * @param id The ID of the campaign.
     * @return softCaps The array of soft caps in wei.
     */
    function getSoftCaps(uint256 id) external view returns (uint256[] memory) {
        return campaigns[id].softCaps;
    }

    /**
     * @notice Calculates the refundable overflow amount for a given backer after deadline.
     * @param id The ID of the campaign.
     * @param backer The address of the backer.
     * @return The refundable amount in wei.
     */
    function getRefundableAmount(uint256 id, address backer) public view returns (uint256) {
        Campaign storage campaign = campaigns[id];
        if (block.timestamp < campaign.deadline) {
            return 0;
        }

        uint256 contributed = contributions[id][backer];
        if (contributed == 0 || campaign.raised == 0) {
            return 0;
        }

        uint256 unlocked = getUnlockedAmount(id);
        if (campaign.raised <= unlocked) {
            return 0;
        }

        uint256 overflow = campaign.raised - unlocked;
        return (contributed * overflow) / campaign.raised;
    }

    /**
     * @notice Creator step-by-step withdrawal of unlocked tranches (allowed before or after deadline).
     * @param id The ID of the campaign.
     */
    function withdraw(uint256 id) external nonReentrant {
        Campaign storage campaign = campaigns[id];
        if (campaign.owner == address(0)) revert CampaignDoesNotExist();
        if (msg.sender != campaign.owner) revert NotOwner();

        uint256 unlocked = getUnlockedAmount(id);
        if (unlocked == 0) revert GoalNotMet();
        if (unlocked <= campaign.withdrawn) revert AlreadyClaimed();

        uint256 payout = unlocked - campaign.withdrawn;

        // CEI: update state before external transfer
        campaign.withdrawn += payout;
        if (campaign.withdrawn >= unlocked && unlocked >= campaign.goal) {
            campaign.claimed = true;
        }

        (bool success, ) = payable(campaign.owner).call{value: payout}("");
        if (!success) revert TransferFailed();

        emit Withdrawn(id, campaign.owner, payout);
    }

    /**
     * @notice Refunds a backer's pro-rata share of un-unlocked overflow after the deadline.
     * @param id The ID of the campaign.
     */
    function claimRefund(uint256 id) external nonReentrant {
        Campaign storage campaign = campaigns[id];
        if (campaign.owner == address(0)) revert CampaignDoesNotExist();
        if (block.timestamp < campaign.deadline) revert CampaignNotEnded();

        uint256 unlocked = getUnlockedAmount(id);
        if (campaign.raised >= campaign.goal) revert GoalMet();
        if (campaign.raised <= unlocked) revert NoRefundAvailable();

        uint256 overflow = campaign.raised - unlocked;

        uint256 contributed = contributions[id][msg.sender];
        if (contributed == 0) revert NoContribution();

        uint256 refundAmount = (contributed * overflow) / campaign.raised;

        // CEI: zero out contribution before external transfer
        contributions[id][msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        if (!success) revert TransferFailed();

        emit Refunded(id, msg.sender, refundAmount);
    }

    /**
     * @notice Gets the details of a specific campaign.
     * @param id The ID of the campaign.
     */
    function getCampaign(uint256 id)
        external
        view
        returns (
            address owner,
            uint256 goal,
            uint256 deadline,
            uint256 raised,
            bool claimed,
            string memory metadataCid,
            uint256 withdrawn,
            uint256 unlocked,
            uint256[] memory softCaps
        )
    {
        Campaign storage c = campaigns[id];
        owner = c.owner;
        goal = c.goal;
        deadline = c.deadline;
        raised = c.raised;
        claimed = c.claimed;
        metadataCid = c.metadataCid;
        withdrawn = c.withdrawn;
        softCaps = c.softCaps;
        unlocked = getUnlockedAmount(id);
    }
}
