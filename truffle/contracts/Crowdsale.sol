// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


/**
 * @title Crowdsale
 * @dev Crowdsale is a base contract for managing a token crowdsale.
 */
contract Crowdsale is Context, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // The token being sold
    IERC20 private immutable _token;

    // Address where funds are collected
    address payable private immutable _wallet;

    // How many token units a buyer gets per wei
    uint256 private immutable _rate;

    // Amount of wei raised
    uint256 private _weiRaised;

    event TokensPurchased(
        address indexed purchaser,
        address indexed beneficiary,
        uint256 value,
        uint256 amount
    );

    constructor(uint256 rate, address payable wallet, IERC20 token) {
        require(rate > 0, "Crowdsale: rate is 0");
        require(wallet != address(0), "Crowdsale: wallet is the zero address");
        require(address(token) != address(0), "Crowdsale: token is zero address");

        _rate = rate;
        _wallet = wallet;
        _token = token;
    }

    receive() external payable {
        buyTokens(_msgSender());
    }

    function token() public view returns (IERC20) {
        return _token;
    }

    function wallet() public view returns (address payable) {
        return _wallet;
    }

    function rate() public view returns (uint256) {
        return _rate;
    }

    function weiRaised() public view returns (uint256) {
        return _weiRaised;
    }

    function buyTokens(address beneficiary) public payable nonReentrant {
        uint256 weiAmount = msg.value;
        _preValidatePurchase(beneficiary, weiAmount);

        uint256 tokens = _getTokenAmount(weiAmount);

        _weiRaised += weiAmount;

        _processPurchase(beneficiary, tokens);
        emit TokensPurchased(_msgSender(), beneficiary, weiAmount, tokens);

        _updatePurchasingState(beneficiary, weiAmount);

        _forwardFunds();
        _postValidatePurchase(beneficiary, weiAmount);
    }

    function _preValidatePurchase(
        address beneficiary,
        uint256 weiAmount
    ) internal view virtual {
        require(beneficiary != address(0), "Crowdsale: beneficiary is zero address");
        require(weiAmount != 0, "Crowdsale: weiAmount is 0");
    }

    function _postValidatePurchase(
        address beneficiary,
        uint256 weiAmount
    ) internal view virtual {
        // hook
    }

    function _deliverTokens(address beneficiary, uint256 tokenAmount) internal virtual {
        _token.safeTransfer(beneficiary, tokenAmount);
    }

    function _processPurchase(address beneficiary, uint256 tokenAmount) internal virtual {
        _deliverTokens(beneficiary, tokenAmount);
    }

    function _updatePurchasingState(
        address beneficiary,
        uint256 weiAmount
    ) internal virtual {
        // hook
    }

    function _getTokenAmount(uint256 weiAmount) internal view returns (uint256) {
        return weiAmount * _rate;
    }

    function _forwardFunds() internal virtual {
        _wallet.transfer(msg.value);
    }
}
