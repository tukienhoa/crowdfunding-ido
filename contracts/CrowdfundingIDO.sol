// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ERC20Entangled.sol";

struct Range {
    uint256 start;
    uint256 end;
}

struct IDOParams {
    ERC20Entangled token;
    uint32 multiplier;
    Range open;
    uint256 baseAmount;
    uint256 maxAmountPerAddress;
    uint256 totalBought;
    string name;
    string description;
    string logoIPFS;
    string bgIPFS;
}

struct IDO {
    IDOParams params;
    address owner;
    uint256 paidToOwner;
}

contract CrowdfundingIDO is Ownable {
    IDO[] private idos;
    mapping(uint256 => mapping(address => uint256)) bought;
    mapping(uint256 => mapping(address => bool)) _beenPaid;

    constructor() {}

    function idosLength() public view returns (uint256) {
        return idos.length;
    }

    function getIDOtokenName(uint256 id) public view returns (string memory) {
        return idos[id].params.token.name();
    }

    function getIDOtokenSymbol(uint256 id) public view returns (string memory) {
        return idos[id].params.token.symbol();
    }

    function getId(uint256 id) internal view returns (IDO storage ido) {
        require(idos.length > id, "IDO id non-existant");
        return idos[id];
    }

    function publish(
        string memory tokenName,
        string memory tokenSymbol,
        IDOParams memory params
    ) public {
        require(block.timestamp < params.open.end, "would already ended");
        require(
            params.open.start < params.open.end,
            "start time should be before end time"
        );

        ERC20Entangled token = new ERC20Entangled(tokenName, tokenSymbol);
        uint256 id = idos.length;
        idos.push(IDO(params, msg.sender, 0));
        IDO storage ido = idos[id];
        ido.params.token = token;
        ido.params.totalBought = 0;

        emit IDOPublished(id, ido);
    }

    function information(uint256 id) public view returns (IDO memory) {
        return idos[id];
    }

    /**
     * @dev Returns if the selected address can buy.
     */
    function canBuy(uint256 id) private view returns (bool status) {
        IDO storage ido = idos[id];
        return
            (block.timestamp >= ido.params.open.start) &&
            (block.timestamp < ido.params.open.end);
    }

    function _availableToBuy(IDO storage ido)
        private
        view
        returns (uint256 quantity)
    {
        return ido.params.baseAmount - ido.params.totalBought;
    }

    /**
     * @dev Buy the base amount in wei, Fail on unsuccessful tx.
     */
    function buy(uint256 id, uint256 amount) public payable {
        IDO storage ido = getId(id);
        require(canBuy(id), "Can't buy");
        require(amount <= _availableToBuy(ido), "Not enough available to buy");
        require(
            bought[id][msg.sender] + amount <= ido.params.maxAmountPerAddress,
            "Exceding max amount"
        );
        bought[id][msg.sender] += amount;
        ido.params.totalBought += amount;
        emit Bought(id, msg.sender, amount, ido.params.totalBought);
    }

    /**
     * @dev Withdraws the amount, Fails on unsuccessful tx.
     */
    function withdraw(uint256 id, uint256 amount) public {
        IDO storage ido = getId(id);
        require(block.timestamp >= ido.params.open.end, "Project still open");
        require(ido.paidToOwner == 0, "Already paid to owner");
        require(bought[id][msg.sender] >= amount, "Not enough bought");
        require(!_beenPaid[id][msg.sender], "Already claimed token");
        bought[id][msg.sender] -= amount;
        ido.params.totalBought -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawn(id, msg.sender, amount, ido.params.totalBought);
    }

    /**
     * @dev Get's the payout, Fails on unsuccessful tx.
     */
    function getPayout(uint256 id) public {
        getPayoutOn(id, msg.sender);
    }

    /**
     * @dev Get's the payout, but in a specific address.
     */
    function getPayoutOn(uint256 id, address otherAddress) public {
        IDO storage ido = getId(id);
        uint256 amount = bought[id][msg.sender];
        require(block.timestamp >= ido.params.open.end, "Project still open");
        require(amount > 0, "Nothing to claim");
        require(!_beenPaid[id][msg.sender], "Already claimed");
        ido.params.token.mint(otherAddress, amount * ido.params.multiplier);
        _beenPaid[id][msg.sender] = true;
    }

    /**
     * @dev Get's the payout, but in a specific address.
     */
    function beenPaid(uint256 id, address account)
        public
        view
        returns (bool paid)
    {
        return _beenPaid[id][account];
    }

    /**
     * @dev Empties the contract wei and sends it to the owner
     */
    function getRaised(uint256 id) public {
        IDO storage ido = getId(id);
        require(ido.owner == msg.sender, "must be owner");
        require(
            ido.params.open.end <= block.timestamp,
            "Project must be ended"
        );
        require(ido.params.totalBought != 0, "Nothing to claim");
        uint256 payout = ido.params.totalBought - ido.paidToOwner;
        payable(msg.sender).transfer(payout);
        ido.paidToOwner = ido.params.totalBought;
    }

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function boughtAmount(uint256 id, address account)
        public
        view
        returns (uint256)
    {
        return bought[id][account];
    }

    /**
     * @dev Emitted when an IDO is published.
     */
    event IDOPublished(uint256 id, IDO ido);

    /**
     * @dev Emitted when a user buys
     */
    event Bought(
        uint256 id,
        address owner,
        uint256 quantity,
        uint256 totalBought
    );

    /**
     * @dev Emitted when a user withdraws
     */
    event Withdrawn(
        uint256 id,
        address owner,
        uint256 quantity,
        uint256 totalBought
    );
}
