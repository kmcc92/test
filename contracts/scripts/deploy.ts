import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("Deploying contracts with:", deployer.address);
  console.log(
    "Account balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "MATIC"
  );

  console.log("\n1. Deploying BrandRegistry...");
  const BrandRegistry = await ethers.getContractFactory("BrandRegistry");
  const brandRegistry = await BrandRegistry.deploy(deployer.address);
  await brandRegistry.waitForDeployment();
  const brandRegistryAddress = await brandRegistry.getAddress();
  console.log("   BrandRegistry:", brandRegistryAddress);

  console.log("\n2. Deploying ItemRegistry...");
  const ItemRegistry = await ethers.getContractFactory("ItemRegistry");
  const itemRegistry = await ItemRegistry.deploy(deployer.address, brandRegistryAddress);
  await itemRegistry.waitForDeployment();
  const itemRegistryAddress = await itemRegistry.getAddress();
  console.log("   ItemRegistry:", itemRegistryAddress);

  console.log("\n3. Deploying AuctionHouse...");
  const AuctionHouse = await ethers.getContractFactory("AuctionHouse");
  const auctionHouse = await AuctionHouse.deploy(
    deployer.address,
    itemRegistryAddress,
    deployer.address // fee recipient — update before mainnet
  );
  await auctionHouse.waitForDeployment();
  const auctionHouseAddress = await auctionHouse.getAddress();
  console.log("   AuctionHouse:", auctionHouseAddress);

  const deploymentInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      BrandRegistry: brandRegistryAddress,
      ItemRegistry: itemRegistryAddress,
      AuctionHouse: auctionHouseAddress,
    },
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `${network.name}-${Date.now()}.json`;
  fs.writeFileSync(path.join(deploymentsDir, filename), JSON.stringify(deploymentInfo, null, 2));
  fs.writeFileSync(path.join(deploymentsDir, "latest.json"), JSON.stringify(deploymentInfo, null, 2));

  console.log("\n✅ Deployment complete!");
  console.log("Addresses:", JSON.stringify(deploymentInfo.contracts, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
