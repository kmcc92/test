// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./ItemRegistry.sol";

/**
 * @title AuctionHouse
 * @notice Live auction system for verified luxury NFTs with escrow, anti-sniping, and dual confirmation
 */
contract AuctionHouse is ReentrancyGuard, AccessControl, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    uint256 public constant ANTI_SNIPE_WINDOW = 5 minutes;
    uint256 public constant ANTI_SNIPE_EXTENSION = 10 minutes;
    uint256 public constant MIN_BID_INCREMENT_BPS = 500;  // 5%
    uint256 public constant PLATFORM_FEE_BPS = 250;       // 2.5%

    ItemRegistry public immutable itemRegistry;
    address public feeRecipient;

    enum AuctionStatus { Active, Ended, Settled, Cancelled }

    struct Auction {
        uint256 auctionId;
        uint256 tokenId;
        address seller;
        uint256 reservePrice;
        uint256 startTime;
        uint256 endTime;
        uint256 highestBid;
        address highestBidder;
        AuctionStatus status;
        bool buyerConfirmed;
        bool sellerConfirmed;
    }

    uint256 private _auctionIdCounter;

    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => mapping(address => uint256)) public pendingReturns;
    mapping(uint256 => bool) public tokenListed;

    event AuctionCreated(
        uint256 indexed auctionId,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 reservePrice,
        uint256 startTime,
        uint256 endTime
    );
    event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount, uint256 newEndTime);
    event AuctionEnded(uint256 indexed auctionId, address indexed winner, uint256 amount);
    event AuctionSettled(uint256 indexed auctionId, uint256 platformFee, uint256 sellerProceeds);
    event AuctionCancelled(uint256 indexed auctionId);
    event ReceiptConfirmed(uint256 indexed auctionId, address indexed confirmer);
    event WithdrawalProcessed(address indexed bidder, uint256 amount);

    error TokenNotOwned();
    error TokenAlreadyListed();
    error AuctionNotActive();
    error AuctionNotEnded();
    error AuctionAlreadySettled();
    error BidTooLow();
    error AuctionNotFound();
    error NotSeller();
    error NotWinner();
    error InvalidDuration();
    error InvalidReservePrice();
    error NothingToWithdraw();
    error TransferFailed();
    error HasActiveBids();

    constructor(address admin, address itemRegistryAddress, address _feeRecipient) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        itemRegistry = ItemRegistry(itemRegistryAddress);
        feeRecipient = _feeRecipient;
        _auctionIdCounter = 1;
    }

    function createAuction(
        uint256 tokenId,
        uint256 reservePrice,
        uint256 duration
    ) external whenNotPaused returns (uint256) {
        if (itemRegistry.ownerOf(tokenId) != msg.sender) revert TokenNotOwned();
        if (tokenListed[tokenId]) revert TokenAlreadyListed();
        if (duration < 1 hours || duration > 30 days) revert InvalidDuration();
        if (reservePrice == 0) revert InvalidReservePrice();

        itemRegistry.transferFrom(msg.sender, address(this), tokenId);

        uint256 auctionId = _auctionIdCounter++;
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + duration;

        auctions[auctionId] = Auction({
            auctionId: auctionId,
            tokenId: tokenId,
            seller: msg.sender,
            reservePrice: reservePrice,
            startTime: startTime,
            endTime: endTime,
            highestBid: 0,
            highestBidder: address(0),
            status: AuctionStatus.Active,
            buyerConfirmed: false,
            sellerConfirmed: false
        });

        tokenListed[tokenId] = true;

        emit AuctionCreated(auctionId, tokenId, msg.sender, reservePrice, startTime, endTime);
        return auctionId;
    }

    function placeBid(uint256 auctionId) external payable nonReentrant whenNotPaused {
        Auction storage auction = auctions[auctionId];
        if (auction.auctionId == 0) revert AuctionNotFound();
        if (auction.status != AuctionStatus.Active) revert AuctionNotActive();
        if (block.timestamp >= auction.endTime) revert AuctionNotActive();

        uint256 minBid = auction.highestBid == 0
            ? auction.reservePrice
            : auction.highestBid + (auction.highestBid * MIN_BID_INCREMENT_BPS / 10000);

        if (msg.value < minBid) revert BidTooLow();

        if (auction.highestBidder != address(0)) {
            pendingReturns[auctionId][auction.highestBidder] += auction.highestBid;
        }

        auction.highestBid = msg.value;
        auction.highestBidder = msg.sender;

        uint256 newEndTime = auction.endTime;
        if (auction.endTime - block.timestamp < ANTI_SNIPE_WINDOW) {
            newEndTime = block.timestamp + ANTI_SNIPE_EXTENSION;
            auction.endTime = newEndTime;
        }

        emit BidPlaced(auctionId, msg.sender, msg.value, newEndTime);
    }

    function withdrawPendingReturn(uint256 auctionId) external nonReentrant {
        uint256 amount = pendingReturns[auctionId][msg.sender];
        if (amount == 0) revert NothingToWithdraw();

        pendingReturns[auctionId][msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert TransferFailed();

        emit WithdrawalProcessed(msg.sender, amount);
    }

    function endAuction(uint256 auctionId) external {
        Auction storage auction = auctions[auctionId];
        if (auction.auctionId == 0) revert AuctionNotFound();
        if (auction.status != AuctionStatus.Active) revert AuctionNotActive();
        if (block.timestamp < auction.endTime) revert AuctionNotEnded();

        auction.status = AuctionStatus.Ended;

        if (auction.highestBidder == address(0)) {
            itemRegistry.transferFrom(address(this), auction.seller, auction.tokenId);
            auction.status = AuctionStatus.Cancelled;
            tokenListed[auction.tokenId] = false;
            emit AuctionCancelled(auctionId);
        } else {
            emit AuctionEnded(auctionId, auction.highestBidder, auction.highestBid);
        }
    }

    function confirmReceipt(uint256 auctionId) external {
        Auction storage auction = auctions[auctionId];
        if (auction.status != AuctionStatus.Ended) revert AuctionNotEnded();
        if (msg.sender != auction.highestBidder) revert NotWinner();

        auction.buyerConfirmed = true;
        emit ReceiptConfirmed(auctionId, msg.sender);

        if (auction.sellerConfirmed) _settle(auctionId);
    }

    function confirmShipment(uint256 auctionId) external {
        Auction storage auction = auctions[auctionId];
        if (auction.status != AuctionStatus.Ended) revert AuctionNotEnded();
        if (msg.sender != auction.seller) revert NotSeller();

        auction.sellerConfirmed = true;
        emit ReceiptConfirmed(auctionId, msg.sender);

        if (auction.buyerConfirmed) _settle(auctionId);
    }

    function adminSettle(uint256 auctionId) external onlyRole(ADMIN_ROLE) {
        Auction storage auction = auctions[auctionId];
        if (auction.status != AuctionStatus.Ended) revert AuctionNotEnded();
        _settle(auctionId);
    }

    function _settle(uint256 auctionId) internal nonReentrant {
        Auction storage auction = auctions[auctionId];
        if (auction.status == AuctionStatus.Settled) revert AuctionAlreadySettled();

        auction.status = AuctionStatus.Settled;
        tokenListed[auction.tokenId] = false;

        uint256 platformFee = auction.highestBid * PLATFORM_FEE_BPS / 10000;
        uint256 sellerProceeds = auction.highestBid - platformFee;

        itemRegistry.transferFrom(address(this), auction.highestBidder, auction.tokenId);

        (bool feeSuccess, ) = payable(feeRecipient).call{value: platformFee}("");
        if (!feeSuccess) revert TransferFailed();

        (bool sellerSuccess, ) = payable(auction.seller).call{value: sellerProceeds}("");
        if (!sellerSuccess) revert TransferFailed();

        emit AuctionSettled(auctionId, platformFee, sellerProceeds);
    }

    function cancelAuction(uint256 auctionId) external {
        Auction storage auction = auctions[auctionId];
        if (auction.auctionId == 0) revert AuctionNotFound();
        if (auction.status != AuctionStatus.Active) revert AuctionNotActive();
        if (msg.sender != auction.seller && !hasRole(ADMIN_ROLE, msg.sender)) revert NotSeller();
        if (auction.highestBidder != address(0)) revert HasActiveBids();

        auction.status = AuctionStatus.Cancelled;
        tokenListed[auction.tokenId] = false;

        itemRegistry.transferFrom(address(this), auction.seller, auction.tokenId);
        emit AuctionCancelled(auctionId);
    }

    function getLiveAuctions() external view returns (Auction[] memory) {
        uint256 total = _auctionIdCounter - 1;
        uint256 count = 0;

        for (uint256 i = 1; i <= total; i++) {
            if (auctions[i].status == AuctionStatus.Active && block.timestamp < auctions[i].endTime) {
                count++;
            }
        }

        Auction[] memory live = new Auction[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i <= total; i++) {
            if (auctions[i].status == AuctionStatus.Active && block.timestamp < auctions[i].endTime) {
                live[idx++] = auctions[i];
            }
        }
        return live;
    }

    function updateFeeRecipient(address newRecipient) external onlyRole(ADMIN_ROLE) {
        feeRecipient = newRecipient;
    }

    function pause() external onlyRole(ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(ADMIN_ROLE) { _unpause(); }
}
