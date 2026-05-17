import { expect } from "chai";
import { ethers } from "hardhat";
import { BrandRegistry, ItemRegistry, AuctionHouse } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("AuctionHouse", () => {
  let brandRegistry: BrandRegistry;
  let itemRegistry: ItemRegistry;
  let auctionHouse: AuctionHouse;
  let admin: SignerWithAddress;
  let brandOwner: SignerWithAddress;
  let seller: SignerWithAddress;
  let bidder1: SignerWithAddress;
  let bidder2: SignerWithAddress;
  let tokenId: bigint;

  const ONE_MATIC = ethers.parseEther("1");
  const DURATION = 24 * 60 * 60; // 1 day in seconds

  beforeEach(async () => {
    [admin, brandOwner, seller, bidder1, bidder2] = await ethers.getSigners();

    const BRFactory = await ethers.getContractFactory("BrandRegistry");
    brandRegistry = await BRFactory.deploy(admin.address);

    const IRFactory = await ethers.getContractFactory("ItemRegistry");
    itemRegistry = await IRFactory.deploy(admin.address, await brandRegistry.getAddress());

    const AHFactory = await ethers.getContractFactory("AuctionHouse");
    auctionHouse = await AHFactory.deploy(
      admin.address,
      await itemRegistry.getAddress(),
      admin.address
    );

    // Setup: register + verify brand, mint NFT to seller
    await brandRegistry.connect(brandOwner).registerBrand("Gucci", "ipfs://logo", "ipfs://meta");
    const brandId = await brandRegistry.ownerToBrandId(brandOwner.address);
    await brandRegistry.connect(admin).verifyBrand(brandId);

    await itemRegistry.connect(brandOwner).mintItem(seller.address, "CHIP-AUCTION-001", "QmHash", brandId);
    tokenId = await itemRegistry.chipIdToTokenId("CHIP-AUCTION-001");

    await itemRegistry.connect(seller).approve(await auctionHouse.getAddress(), tokenId);
  });

  it("creates an auction and escrows the NFT", async () => {
    await auctionHouse.connect(seller).createAuction(tokenId, ONE_MATIC, DURATION);
    const auction = await auctionHouse.auctions(1n);

    expect(auction.seller).to.equal(seller.address);
    expect(auction.reservePrice).to.equal(ONE_MATIC);
    expect(auction.status).to.equal(0); // Active
    expect(await itemRegistry.ownerOf(tokenId)).to.equal(await auctionHouse.getAddress());
  });

  it("accepts a valid bid at reserve price", async () => {
    await auctionHouse.connect(seller).createAuction(tokenId, ONE_MATIC, DURATION);
    await auctionHouse.connect(bidder1).placeBid(1n, { value: ONE_MATIC });

    const auction = await auctionHouse.auctions(1n);
    expect(auction.highestBidder).to.equal(bidder1.address);
    expect(auction.highestBid).to.equal(ONE_MATIC);
  });

  it("rejects bid below reserve price", async () => {
    await auctionHouse.connect(seller).createAuction(tokenId, ONE_MATIC, DURATION);
    await expect(
      auctionHouse.connect(bidder1).placeBid(1n, { value: ethers.parseEther("0.5") })
    ).to.be.revertedWithCustomError(auctionHouse, "BidTooLow");
  });

  it("rejects bid below minimum increment", async () => {
    await auctionHouse.connect(seller).createAuction(tokenId, ONE_MATIC, DURATION);
    await auctionHouse.connect(bidder1).placeBid(1n, { value: ONE_MATIC });
    await expect(
      auctionHouse.connect(bidder2).placeBid(1n, { value: ONE_MATIC }) // needs 5% more
    ).to.be.revertedWithCustomError(auctionHouse, "BidTooLow");
  });

  it("stores outbid amount in pending returns", async () => {
    await auctionHouse.connect(seller).createAuction(tokenId, ONE_MATIC, DURATION);
    await auctionHouse.connect(bidder1).placeBid(1n, { value: ONE_MATIC });

    const higherBid = ethers.parseEther("1.1");
    await auctionHouse.connect(bidder2).placeBid(1n, { value: higherBid });

    const pending = await auctionHouse.pendingReturns(1n, bidder1.address);
    expect(pending).to.equal(ONE_MATIC);
  });

  it("extends auction on late bid (anti-sniping)", async () => {
    await auctionHouse.connect(seller).createAuction(tokenId, ONE_MATIC, DURATION);
    const auction = await auctionHouse.auctions(1n);

    // Jump to 4 minutes before end (inside ANTI_SNIPE_WINDOW of 5 min)
    await time.increaseTo(Number(auction.endTime) - 4 * 60);

    const endBefore = (await auctionHouse.auctions(1n)).endTime;
    await auctionHouse.connect(bidder1).placeBid(1n, { value: ONE_MATIC });
    const endAfter = (await auctionHouse.auctions(1n)).endTime;

    expect(endAfter).to.be.greaterThan(endBefore);
  });

  it("ends auction with no bids and returns NFT to seller", async () => {
    await auctionHouse.connect(seller).createAuction(tokenId, ONE_MATIC, DURATION);
    const auction = await auctionHouse.auctions(1n);
    await time.increaseTo(Number(auction.endTime) + 1);

    await auctionHouse.endAuction(1n);

    expect(await itemRegistry.ownerOf(tokenId)).to.equal(seller.address);
    expect((await auctionHouse.auctions(1n)).status).to.equal(3); // Cancelled
  });

  it("settles auction after both parties confirm", async () => {
    await auctionHouse.connect(seller).createAuction(tokenId, ONE_MATIC, DURATION);
    await auctionHouse.connect(bidder1).placeBid(1n, { value: ONE_MATIC });

    const auction = await auctionHouse.auctions(1n);
    await time.increaseTo(Number(auction.endTime) + 1);
    await auctionHouse.endAuction(1n);

    await auctionHouse.connect(seller).confirmShipment(1n);
    await auctionHouse.connect(bidder1).confirmReceipt(1n);

    const settled = await auctionHouse.auctions(1n);
    expect(settled.status).to.equal(2); // Settled
    expect(await itemRegistry.ownerOf(tokenId)).to.equal(bidder1.address);
  });

  it("cannot cancel auction with active bids", async () => {
    await auctionHouse.connect(seller).createAuction(tokenId, ONE_MATIC, DURATION);
    await auctionHouse.connect(bidder1).placeBid(1n, { value: ONE_MATIC });
    await expect(
      auctionHouse.connect(seller).cancelAuction(1n)
    ).to.be.revertedWithCustomError(auctionHouse, "HasActiveBids");
  });

  it("bidder can withdraw pending returns", async () => {
    await auctionHouse.connect(seller).createAuction(tokenId, ONE_MATIC, DURATION);
    await auctionHouse.connect(bidder1).placeBid(1n, { value: ONE_MATIC });
    await auctionHouse.connect(bidder2).placeBid(1n, { value: ethers.parseEther("1.1") });

    const balanceBefore = await ethers.provider.getBalance(bidder1.address);
    const tx = await auctionHouse.connect(bidder1).withdrawPendingReturn(1n);
    const receipt = await tx.wait();
    const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
    const balanceAfter = await ethers.provider.getBalance(bidder1.address);

    expect(balanceAfter + gasUsed).to.be.closeTo(balanceBefore + ONE_MATIC, ethers.parseEther("0.001"));
  });
});
