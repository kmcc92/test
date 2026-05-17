import { expect } from "chai";
import { ethers } from "hardhat";
import { BrandRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("BrandRegistry", () => {
  let brandRegistry: BrandRegistry;
  let admin: SignerWithAddress;
  let brand1: SignerWithAddress;
  let brand2: SignerWithAddress;

  beforeEach(async () => {
    [admin, brand1, brand2] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("BrandRegistry");
    brandRegistry = await Factory.deploy(admin.address);
  });

  it("registers a brand", async () => {
    const tx = await brandRegistry.connect(brand1).registerBrand("Gucci", "ipfs://logo", "ipfs://meta");
    await tx.wait();

    const brandId = await brandRegistry.ownerToBrandId(brand1.address);
    const brand = await brandRegistry.getBrand(brandId);
    expect(brand.name).to.equal("Gucci");
    expect(brand.verified).to.equal(false);
  });

  it("prevents duplicate registration by same address", async () => {
    await brandRegistry.connect(brand1).registerBrand("Gucci", "ipfs://logo", "ipfs://meta");
    await expect(
      brandRegistry.connect(brand1).registerBrand("Prada", "ipfs://logo2", "ipfs://meta2")
    ).to.be.revertedWithCustomError(brandRegistry, "BrandAlreadyRegistered");
  });

  it("prevents duplicate brand names", async () => {
    await brandRegistry.connect(brand1).registerBrand("Gucci", "ipfs://logo", "ipfs://meta");
    await expect(
      brandRegistry.connect(brand2).registerBrand("Gucci", "ipfs://logo2", "ipfs://meta2")
    ).to.be.revertedWithCustomError(brandRegistry, "BrandNameTaken");
  });

  it("admin can verify a brand", async () => {
    await brandRegistry.connect(brand1).registerBrand("Gucci", "ipfs://logo", "ipfs://meta");
    const brandId = await brandRegistry.ownerToBrandId(brand1.address);
    await brandRegistry.connect(admin).verifyBrand(brandId);
    expect(await brandRegistry.isBrandVerified(brandId)).to.equal(true);
  });

  it("non-admin cannot verify a brand", async () => {
    await brandRegistry.connect(brand1).registerBrand("Gucci", "ipfs://logo", "ipfs://meta");
    const brandId = await brandRegistry.ownerToBrandId(brand1.address);
    await expect(brandRegistry.connect(brand2).verifyBrand(brandId)).to.be.reverted;
  });

  it("admin can revoke a brand", async () => {
    await brandRegistry.connect(brand1).registerBrand("Gucci", "ipfs://logo", "ipfs://meta");
    const brandId = await brandRegistry.ownerToBrandId(brand1.address);
    await brandRegistry.connect(admin).verifyBrand(brandId);
    await brandRegistry.connect(admin).revokeBrand(brandId);
    expect(await brandRegistry.isBrandVerified(brandId)).to.equal(false);
  });

  it("verified brand owner can add rules", async () => {
    await brandRegistry.connect(brand1).registerBrand("Gucci", "ipfs://logo", "ipfs://meta");
    const brandId = await brandRegistry.ownerToBrandId(brand1.address);
    await brandRegistry.connect(admin).verifyBrand(brandId);
    await brandRegistry.connect(brand1).addVerificationRule(brandId, "NFC", '{"pattern":"GU-*"}');
    const rules = await brandRegistry.getBrandRules(brandId);
    expect(rules.length).to.equal(1);
    expect(rules[0].ruleType).to.equal("NFC");
  });

  it("unverified brand cannot add rules", async () => {
    await brandRegistry.connect(brand1).registerBrand("Gucci", "ipfs://logo", "ipfs://meta");
    const brandId = await brandRegistry.ownerToBrandId(brand1.address);
    await expect(
      brandRegistry.connect(brand1).addVerificationRule(brandId, "NFC", "{}")
    ).to.be.revertedWithCustomError(brandRegistry, "BrandNotVerified");
  });
});
