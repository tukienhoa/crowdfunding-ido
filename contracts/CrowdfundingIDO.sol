// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ERC20Entangled.sol";
import "./ILockedAmount.sol";

struct Vesting {
    address beneficiary;
    uint256 amount;
    uint256 timestamp;
    bool claimed;
}

struct Range {
    uint256 start;
    uint256 end;
}

struct Multiplier {
    uint32 multiplier;
    uint32 divider;
}

struct IDOParams {
    bool approved;
    ERC20Entangled token;
    Multiplier multiplier;
    Range open;
    uint256 minimumLockedAmount;
    uint256 baseAmount;
    uint256 maxAmountPerAddress;
    uint256 totalBought;
}

struct IDO {
    IDOParams params;
    address owner;
    uint256 paidToOwner;
}

uint256 constant MAX_VESTING_OCURRENCES = 5;

function _isValidMultiplier(Multiplier memory multiplier) pure returns (bool) {
    return multiplier.multiplier > 0 && multiplier.divider > 0;
}

contract CrowdfundingIDO is Ownable {
    IDO[] private idos;
    mapping(uint256 => mapping(address => uint256)) bought;
    mapping(uint256 => mapping(address => bool)) _beenPaid;
    Vesting[MAX_VESTING_OCURRENCES][] _vesting;
    ILockedAmount private _lockingContract;

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
        IDOParams memory params,
        Vesting[MAX_VESTING_OCURRENCES] calldata vesting
    ) public {
        require(block.timestamp < params.open.end, "would already ended");
        require(
            params.open.start < params.open.end,
            "start time should be before end time"
        );
        require(
            _isValidMultiplier(params.multiplier),
            "Multiplier isn't valid"
        );

        ERC20Entangled token = new ERC20Entangled(tokenName, tokenSymbol);
        uint256 id = idos.length;
        idos.push(IDO(params, msg.sender, 0));
        IDO storage ido = idos[id];
        ido.params.token = token;
        ido.params.totalBought = 0;

        Vesting[MAX_VESTING_OCURRENCES] storage vest = _vesting.push();
        for (uint256 i = 0; i < MAX_VESTING_OCURRENCES; i++) {
            require(
                vest[i].beneficiary == address(0) ||
                    vest[i].timestamp >= ido.params.open.end,
                "Tokens must be vested after the IDO ends"
            );
            vest[i] = vesting[i];
        }

        emit IDOPublished(id, ido);
    }

    function information(uint256 id) public view returns (IDO memory) {
        return idos[id];
    }

    function vestingFor(uint256 id)
        public
        view
        returns (Vesting[MAX_VESTING_OCURRENCES] memory vesting)
    {
        return _vesting[id];
    }

    function claimVesting(uint256 id, uint256 index) external {
        Vesting storage vesting = _vesting[id][index];
        IDO storage ido = getId(id);
        require(!vesting.claimed, "Already claimed");
        require(vesting.timestamp >= block.timestamp);
        require(ido.owner == msg.sender, "Not IDO Owner");
        ido.params.token.mint(vesting.beneficiary, vesting.amount);
        vesting.claimed = true;
    }

    function setLockingAddress(address where) public onlyOwner {
        _lockingContract = ILockedAmount(where);
    }

    function lockingContract() public view returns (address) {
        return address(_lockingContract);
    }

    /**
     * @dev Returns if the selected address is whitelisted via locking.
     */

    function whitelisted(uint256 id, address account)
        public
        view
        returns (bool status)
    {
        if (_lockingContract == ILockedAmount(address(0))) return true;
        IDO storage ido = idos[id];
        if (ido.params.minimumLockedAmount == 0) return true;
        return (_lockingContract.lockedAmount(account) >=
            ido.params.minimumLockedAmount);
    }

    /**
     * @dev Returns if the selected address can buy.
     */
    function canBuy(uint256 id, address account)
        private
        view
        returns (bool status)
    {
        IDO storage ido = idos[id];
        return
            (block.timestamp >= ido.params.open.start) &&
            (block.timestamp < ido.params.open.end) &&
            whitelisted(id, account);
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
        require(msg.value == amount, "Non matching wei");
        require(canBuy(id, msg.sender), "Can't buy");
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
        require(bought[id][msg.sender] >= amount, "Not enough bought");
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
        require(amount > 0, "Nothing to pay");
        require(!_beenPaid[id][msg.sender], "Already paid");
        require(block.timestamp >= ido.params.open.end, "Crowdsale still open");
        ido.params.token.mint(
            otherAddress,
            (amount * ido.params.multiplier.multiplier) /
                ido.params.multiplier.divider
        );
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
        require(ido.params.open.end <= block.timestamp, "ido must be ended");
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
