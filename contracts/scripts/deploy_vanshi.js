const hre = require("hardhat");

async function main() {
    console.log("Deploying Vanshi Smart Contracts...");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    // 1. Deploy MockUSDC
    const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
    const usdc = await MockUSDC.deploy();
    await usdc.waitForDeployment();
    console.log("MockUSDC deployed to:", usdc.target);

    // 2. Deploy VanshiCredit
    const VanshiCredit = await hre.ethers.getContractFactory("VanshiCredit");
    const credit = await VanshiCredit.deploy();
    await credit.waitForDeployment();
    console.log("VanshiCredit deployed to:", credit.target);

    // 3. Deploy VanshiMarketplace
    const VanshiMarketplace = await hre.ethers.getContractFactory("VanshiMarketplace");
    const marketplace = await VanshiMarketplace.deploy(
        credit.target,
        usdc.target,
        deployer.address, // Treasury (Admin)
        250 // 2.5% Fee
    );
    await marketplace.waitForDeployment();
    console.log("VanshiMarketplace deployed to:", marketplace.target);

    console.log("\n--- Deployment Summary ---");
    console.log("VANSHI_CREDIT_ADDRESS=" + credit.target);
    console.log("VANSHI_MARKETPLACE_ADDRESS=" + marketplace.target);
    console.log("MockUSDC_ADDRESS=" + usdc.target);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
