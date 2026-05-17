// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./BrandRegistry.sol";

/**
 * @title ItemRegistry
 * @notice ERC721 NFT registry for luxury items with NFC/QR chip binding and ownership history
 */
contract ItemRegistry is ERC721, ERC721URIStorage, ERC721Burnable, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    BrandRegistry public immutable brandRegistry;

    struct Item {
        uint256 tokenId;
        uint256 brandId;
        string chipId;
        string ipfsHash;
        address mintedBy;
        uint256 mintedAt;
        bool stolen;
    }

    struct OwnershipRecord {
        address owner;
        uint256 timestamp;
        string transferType; // "MINT", "TRANSFER", "AUCTION"
    }

    uint256 private _tokenIdCounter;

    mapping(uint256 => Item) public items;
    mapping(string => uint256) public chipIdToTokenId;
    mapping(uint256 => OwnershipRecord[]) public ownershipHistory;

    event ItemMinted(
        uint256 indexed tokenId,
        uint256 indexed brandId,
        string chipId,
        address indexed owner,
        string ipfsHash
    );
    event ItemStolenFlagged(uint256 indexed tokenId, address flaggedBy);
    event ItemStolenCleared(uint256 indexed tokenId, address clearedBy);

    error ChipAlreadyRegistered();
    error ItemNotFound();
    error BrandNotVerified();
    error ItemMarkedStolen();
    error InvalidChipId();
    error UnauthorizedBrand();

    constructor(address admin, address brandRegistryAddress) ERC721("TESTF Item", "TESTF") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        brandRegistry = BrandRegistry(brandRegistryAddress);
        _tokenIdCounter = 1;
    }

    function mintItem(
        address to,
        string calldata chipId,
        string calldata ipfsHash,
        uint256 brandId
    ) external whenNotPaused returns (uint256) {
        if (bytes(chipId).length == 0) revert InvalidChipId();
        if (chipIdToTokenId[chipId] != 0) revert ChipAlreadyRegistered();
        if (!brandRegistry.isBrandVerified(brandId)) revert BrandNotVerified();

        address brandOwner = brandRegistry.getBrand(brandId).owner;
        if (brandOwner != msg.sender && !hasRole(MINTER_ROLE, msg.sender)) revert UnauthorizedBrand();

        uint256 tokenId = _tokenIdCounter++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, string(abi.encodePacked("ipfs://", ipfsHash)));

        items[tokenId] = Item({
            tokenId: tokenId,
            brandId: brandId,
            chipId: chipId,
            ipfsHash: ipfsHash,
            mintedBy: msg.sender,
            mintedAt: block.timestamp,
            stolen: false
        });

        chipIdToTokenId[chipId] = tokenId;

        ownershipHistory[tokenId].push(OwnershipRecord({
            owner: to,
            timestamp: block.timestamp,
            transferType: "MINT"
        }));

        emit ItemMinted(tokenId, brandId, chipId, to, ipfsHash);
        return tokenId;
    }

    function verifyByChipId(string calldata chipId)
        external
        view
        returns (Item memory item, address currentOwner, OwnershipRecord[] memory history)
    {
        uint256 tokenId = chipIdToTokenId[chipId];
        if (tokenId == 0) revert ItemNotFound();
        item = items[tokenId];
        currentOwner = ownerOf(tokenId);
        history = ownershipHistory[tokenId];
    }

    function getOwnershipHistory(uint256 tokenId) external view returns (OwnershipRecord[] memory) {
        return ownershipHistory[tokenId];
    }

    function flagStolen(uint256 tokenId) external onlyRole(ADMIN_ROLE) {
        if (items[tokenId].tokenId == 0) revert ItemNotFound();
        items[tokenId].stolen = true;
        emit ItemStolenFlagged(tokenId, msg.sender);
    }

    function clearStolen(uint256 tokenId) external onlyRole(ADMIN_ROLE) {
        if (items[tokenId].tokenId == 0) revert ItemNotFound();
        items[tokenId].stolen = false;
        emit ItemStolenCleared(tokenId, msg.sender);
    }

    function grantMinterRole(address account) external onlyRole(ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, account);
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721)
        returns (address)
    {
        address from = super._update(to, tokenId, auth);
        if (from != address(0) && to != address(0)) {
            ownershipHistory[tokenId].push(OwnershipRecord({
                owner: to,
                timestamp: block.timestamp,
                transferType: "TRANSFER"
            }));
        }
        return from;
    }

    function pause() external onlyRole(ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(ADMIN_ROLE) { _unpause(); }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
