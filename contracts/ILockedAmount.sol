// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

interface ILockedAmount {
    function lockedAmount(address owner)
        external
        view
        returns (uint256 quantity);
}
