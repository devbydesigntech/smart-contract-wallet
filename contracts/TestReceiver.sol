// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TestReceiver {
    uint256 public value;

    function setValue(uint256 _value) external payable {
        value = _value;
    }

    receive() external payable {}
}