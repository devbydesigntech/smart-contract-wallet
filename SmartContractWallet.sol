// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SmartContractWallet {
    address payable public owner;
    uint256 public constant CONFIRMATIONS_REQUIRED = 3;

    struct SpendingLimit {
        uint256 amount;
        bool isAllowed;
    }
    mapping(address => SpendingLimit) public allowances;

    mapping(address => bool) public guardians;
    address payable public nextOwner;
    mapping(address => mapping(address => bool)) public hasVoted;
    uint256 public guardiansResetCount;
    uint256 public proposalDeadline;

    constructor() {
        owner = payable(msg.sender);
    }

    function setGuardian(address _guardian, bool _isGuardian) external {
        require(msg.sender == owner, "Not owner");
        guardians[_guardian] = _isGuardian;
    }

    function proposeNewOwner(address payable _newOwner) external {
        require(guardians[msg.sender], "Not guardian");
        require(_newOwner != address(0), "Invalid address");
        require(!hasVoted[_newOwner][msg.sender], "Already voted");

        if (_newOwner != nextOwner) {
            nextOwner = _newOwner;
            guardiansResetCount = 0;
            proposalDeadline = block.timestamp + 1 weeks; // Reset after 1 week
        }

        guardiansResetCount++;
        hasVoted[_newOwner][msg.sender] = true;

        if (guardiansResetCount >= CONFIRMATIONS_REQUIRED) {
            owner = nextOwner;
            nextOwner = payable(address(0));
            delete guardiansResetCount;
        }
    }

    function setAllowance(address _for, uint256 _amount) external {
        require(msg.sender == owner, "Not owner");
        allowances[_for] = SpendingLimit({
            amount: _amount,
            isAllowed: _amount > 0
        });
    }

    function transfer(
        address payable _to,
        uint256 _amount,
        bytes memory _payload
    ) external returns (bytes memory) {
        if (msg.sender != owner) {
            SpendingLimit storage limit = allowances[msg.sender];
            require(limit.isAllowed, "Not allowed");
            require(limit.amount >= _amount, "Insufficient allowance");
            limit.amount -= _amount;
        }

        (bool success, bytes memory returnData) = _to.call{value: _amount}(_payload);
        require(success, "Transfer failed");
        return returnData;
    }

    receive() external payable {}
}