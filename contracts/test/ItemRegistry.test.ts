import { expect } from "chai";
import { ethers } from "hardhat";
import { BrandRegistry, ItemRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("ItemRegistry", () => {
  let brandRegistry: BrandRegistry;
  let itemRegistry: ItemRegistry;
  let admin: SignerWithAddress;
  let brandOwner: SignerWithAddress;
  let buyer: SignerWithAddress;
  let brandId: bigint;

  beforeEach(async () => {
    [admin, brandOwner, buyer] = await ethers.getSigners();

    const BRFactory = await ethers.getContractFactory("BrandRegistry");
    brandRegistry = await BRFactory.deploy(admin.address);

    const IRFactory = await ethers.getContractFactory("ItemRegistry");
    itemRegistry = await IRFactory.deploy(admin.address, await brandRegistry.getAddress());

    await brandRegistry.connect(brandOwner).registerBrand("Gucci", "ipfs://logo", "ipfs://meta");
    brandId = await brandRegistry.ownerToBrandId(brandOwner.address);
    await brandRegistry.connect(admin).verifyBrand(brandId);
  });

  it("mints an item NFT with correct chip binding", async () => {
    await itemRegistry.connect(brandOwner).mintItem(buyer.address, "CHIP-001", "QmHash123", brandId);

    const [item, owner, history] = await itemRegistry.verifyByChipId("CHIP-001");
    expect(item.chipId).to.equal("CHIP-001");
    expect(item.ipfsHash).to.equal("QmHash123");
    expect(owner).to.equal(buyer.address);
    expect(history.length).to.equal(1);
    expect(history[0].transferType).to.equal("MINT");
  });

  it("prevents duplicate chip registration", async () => {
    await itemRegistry.connect(brandOwner).mintItem(buyer.address, "CHIP-001", "QmHash123", brandId);
    await expect(
      itemRegistry.connect(brandOwner).mintItem(buyer.address, "CHIP-001", "QmHash456", brandId)
    ).to.be.revertedWithCustomError(itemRegistry, "ChipAlreadyRegistered");
  });

  it("rejects mint from unverified brand", async () => {
    const [, , , other] = await ethers.getSigners();
    await brandRegistry.connect(other).registerBrand("Fake", "ipfs://x", "ipfs://y");
    const fakeBrandId = await brandRegistry.ownerToBrandId(other.address);
    await expect(
      itemRegistry.connect(other).mintItem(buyer.address, "CHIP-002", "QmFake", fakeBrandId)
    ).to.be.revertedWithCustomError(itemRegistry, "BrandNotVerified");
  });

  it("records transfer in ownership history", async () => {
    await itemRegistry.connect(brandOwner).mintItem(buyer.address, "CHIP-003", "QmHash", brandId);
    const tokenId = await itemRegistry.chipIdToTokenId("CHIP-003");

    await itemRegistry.connect(buyer).transferFrom(buyer.address, admin.address, tokenId);
    const history = await itemRegistry.getOwnershipHistory(tokenId);

    expect(history.length).to.equal(2);
    expect(history[1].transferType).to.equal("TRANSFER");
    expect(history[1].owner).to.equal(admin.address);
  });

  it("admin can flag and clear stolen items", async () => {
    await itemRegistry.connect(brandOwner).mintItem(buyer.address, "CHIP-004", "QmHash", brandId);
    const tokenId = await itemRegistry.chipIdToTokenId("CHIP-004");

    await itemRegistry.connect(admin).flagStolen(tokenId);
    expect((await itemRegistry.items(tokenId)).stolen).to.equal(true);

    await itemRegistry.connect(admin).clearStolen(tokenId);
    expect((await itemRegistry.items(tokenId)).stolen).to.equal(false);
  });
});
