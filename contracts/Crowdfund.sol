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

contract Crowdfund is ReentrancyGuard {
    struct Campaign {
        address owner;
        uint256 goal;
        uint256 deadline;
        uint256 raised;
        bool claimed;
        string metadataCid;
    }

    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public contributions;
    uint256 public campaignCount;

    event CampaignCreated(uint256 indexed id, address indexed owner, uint256 goal, uint256 deadline, string metadataCid);
    event Donated(uint256 indexed id, address indexed backer, uint256 amount);
    event Withdrawn(uint256 indexed id, address indexed owner, uint256 amount);
    event Refunded(uint256 indexed id, address indexed backer, uint256 amount);

    /**
     * @notice Creates a new crowdfunding campaign.
     * @param goal The funding goal in wei.
     * @param deadline The timestamp when the campaign ends.
     * @param metadataCid The IPFS CID for campaign metadata.
     * @return id The ID of the newly created campaign.
     */
    function createCampaign(uint256 goal, uint256 deadline, string calldata metadataCid) external returns (uint256 id) {
        if (goal == 0) revert InvalidGoal();
        if (deadline <= block.timestamp + 1 hours) revert InvalidDeadline();
        if (bytes(metadataCid).length == 0) revert InvalidMetadata();

        campaignCount++;
        id = campaignCount;

        campaigns[id] = Campaign({
            owner: msg.sender,
            goal: goal,
            deadline: deadline,
            raised: 0,
            claimed: false,
            metadataCid: metadataCid
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
     * @notice Withdraws the raised funds if the goal was met and the deadline has passed.
     * @param id The ID of the campaign.
     */
    function withdraw(uint256 id) external nonReentrant {
        Campaign storage campaign = campaigns[id];
        if (msg.sender != campaign.owner) revert NotOwner();
        if (block.timestamp < campaign.deadline) revert CampaignNotEnded();
        if (campaign.raised < campaign.goal) revert GoalNotMet();
        if (campaign.claimed) revert AlreadyClaimed();

        campaign.claimed = true;
        uint256 amount = campaign.raised;

        (bool success, ) = payable(campaign.owner).call{value: amount}("");
        if (!success) revert TransferFailed();

        emit Withdrawn(id, campaign.owner, amount);
    }

    /**
     * @notice Refunds a backer's contribution if the campaign failed to meet its goal by the deadline.
     * @param id The ID of the campaign.
     */
    function claimRefund(uint256 id) external nonReentrant {
        Campaign storage campaign = campaigns[id];
        if (block.timestamp < campaign.deadline) revert CampaignNotEnded();
        if (campaign.raised >= campaign.goal) revert GoalMet();

        uint256 amount = contributions[id][msg.sender];
        if (amount == 0) revert NoContribution();

        contributions[id][msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert TransferFailed();

        emit Refunded(id, msg.sender, amount);
    }

    /**
     * @notice Gets the details of a specific campaign.
     * @param id The ID of the campaign.
     * @return owner The creator's address.
     * @return goal The funding goal.
     * @return deadline The deadline timestamp.
     * @return raised The total amount raised.
     * @return claimed Whether the funds have been withdrawn.
     * @return metadataCid The IPFS CID of the metadata.
     */
    function getCampaign(uint256 id) external view returns (address, uint256, uint256, uint256, bool, string memory) {
        Campaign storage campaign = campaigns[id];
        return (campaign.owner, campaign.goal, campaign.deadline, campaign.raised, campaign.claimed, campaign.metadataCid);
    }
}
