// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title BrandRegistry
 * @notice Manages approved luxury brands and their on-chain verification rules
 */
contract BrandRegistry is AccessControl, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct Brand {
        uint256 id;
        address owner;
        string name;
        string logoIpfsHash;
        string metadataIpfsHash;
        bool verified;
        uint256 registeredAt;
        uint256 verifiedAt;
    }

    struct VerificationRule {
        string ruleType;  // "NFC", "QR", "SERIAL"
        string ruleValue; // encoded rule config JSON
        bool active;
    }

    uint256 private _brandIdCounter;

    mapping(uint256 => Brand) public brands;
    mapping(address => uint256) public ownerToBrandId;
    mapping(uint256 => VerificationRule[]) public brandRules;
    mapping(string => bool) public brandNameTaken;

    event BrandRegistered(uint256 indexed brandId, address indexed owner, string name);
    event BrandVerified(uint256 indexed brandId, address indexed verifiedBy);
    event BrandRevoked(uint256 indexed brandId, address indexed revokedBy);
    event VerificationRuleAdded(uint256 indexed brandId, string ruleType);
    event VerificationRuleUpdated(uint256 indexed brandId, uint256 ruleIndex, string ruleType);

    error BrandAlreadyRegistered();
    error BrandNameTaken();
    error BrandNotFound();
    error BrandNotVerified();
    error NotBrandOwner();
    error InvalidInput();

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _brandIdCounter = 1;
    }

    function registerBrand(
        string calldata name,
        string calldata logoIpfsHash,
        string calldata metadataIpfsHash
    ) external whenNotPaused returns (uint256) {
        if (ownerToBrandId[msg.sender] != 0) revert BrandAlreadyRegistered();
        if (brandNameTaken[name]) revert BrandNameTaken();
        if (bytes(name).length == 0) revert InvalidInput();

        uint256 brandId = _brandIdCounter++;
        brands[brandId] = Brand({
            id: brandId,
            owner: msg.sender,
            name: name,
            logoIpfsHash: logoIpfsHash,
            metadataIpfsHash: metadataIpfsHash,
            verified: false,
            registeredAt: block.timestamp,
            verifiedAt: 0
        });

        ownerToBrandId[msg.sender] = brandId;
        brandNameTaken[name] = true;

        emit BrandRegistered(brandId, msg.sender, name);
        return brandId;
    }

    function verifyBrand(uint256 brandId) external onlyRole(ADMIN_ROLE) {
        Brand storage brand = brands[brandId];
        if (brand.id == 0) revert BrandNotFound();
        brand.verified = true;
        brand.verifiedAt = block.timestamp;
        emit BrandVerified(brandId, msg.sender);
    }

    function revokeBrand(uint256 brandId) external onlyRole(ADMIN_ROLE) {
        Brand storage brand = brands[brandId];
        if (brand.id == 0) revert BrandNotFound();
        brand.verified = false;
        emit BrandRevoked(brandId, msg.sender);
    }

    function addVerificationRule(
        uint256 brandId,
        string calldata ruleType,
        string calldata ruleValue
    ) external whenNotPaused {
        Brand storage brand = brands[brandId];
        if (brand.id == 0) revert BrandNotFound();
        if (brand.owner != msg.sender && !hasRole(ADMIN_ROLE, msg.sender)) revert NotBrandOwner();
        if (!brand.verified) revert BrandNotVerified();

        brandRules[brandId].push(VerificationRule({
            ruleType: ruleType,
            ruleValue: ruleValue,
            active: true
        }));

        emit VerificationRuleAdded(brandId, ruleType);
    }

    function updateVerificationRule(
        uint256 brandId,
        uint256 ruleIndex,
        string calldata ruleType,
        string calldata ruleValue,
        bool active
    ) external whenNotPaused {
        Brand storage brand = brands[brandId];
        if (brand.id == 0) revert BrandNotFound();
        if (brand.owner != msg.sender && !hasRole(ADMIN_ROLE, msg.sender)) revert NotBrandOwner();

        VerificationRule storage rule = brandRules[brandId][ruleIndex];
        rule.ruleType = ruleType;
        rule.ruleValue = ruleValue;
        rule.active = active;

        emit VerificationRuleUpdated(brandId, ruleIndex, ruleType);
    }

    function updateBrandMetadata(
        uint256 brandId,
        string calldata logoIpfsHash,
        string calldata metadataIpfsHash
    ) external whenNotPaused {
        Brand storage brand = brands[brandId];
        if (brand.id == 0) revert BrandNotFound();
        if (brand.owner != msg.sender && !hasRole(ADMIN_ROLE, msg.sender)) revert NotBrandOwner();
        brand.logoIpfsHash = logoIpfsHash;
        brand.metadataIpfsHash = metadataIpfsHash;
    }

    function getBrand(uint256 brandId) external view returns (Brand memory) {
        if (brands[brandId].id == 0) revert BrandNotFound();
        return brands[brandId];
    }

    function getBrandRules(uint256 brandId) external view returns (VerificationRule[] memory) {
        return brandRules[brandId];
    }

    function isBrandVerified(uint256 brandId) external view returns (bool) {
        return brands[brandId].verified;
    }

    function getBrandIdByOwner(address owner) external view returns (uint256) {
        return ownerToBrandId[owner];
    }

    function pause() external onlyRole(ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(ADMIN_ROLE) { _unpause(); }
}
