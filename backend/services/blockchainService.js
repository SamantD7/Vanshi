const { ethers } = require("ethers");
const path = require("path");
const ForestLand = require("../models/ForestLand");
const CarbonAsset = require("../models/CarbonAsset");
const CarbonCreditBalance = require("../models/CarbonCreditBalance");
const Transaction = require("../models/Transaction");
const Company = require("../models/Company");
const User = require("../models/User");

// Load ABIs
const creditAbiPath = path.join(__dirname, "../../contracts/artifacts/contracts/VanshiCredit.sol/VanshiCredit.json");
const marketplaceAbiPath = path.join(__dirname, "../../contracts/artifacts/contracts/VanshiMarketplace.sol/VanshiMarketplace.json");
const usdcAbiPath = path.join(__dirname, "../../contracts/artifacts/contracts/test/MockUSDC.sol/MockUSDC.json");

const VANSHI_CREDIT_ABI = require(creditAbiPath).abi;
const VANSHI_MARKETPLACE_ABI = require(marketplaceAbiPath).abi;
const MockUSDC_ABI = require(usdcAbiPath).abi;

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://127.0.0.1:8545");
const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);

// For local testing/managed platforms: Villager Wallet (Hardhat Account #1)
const villagerWallet = new ethers.Wallet(process.env.VILLAGER_PRIVATE_KEY || "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4303d6193c28e", provider);
exports.villagerWallet = villagerWallet;

const creditContract = new ethers.Contract(
    process.env.VANSHI_CREDIT_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    VANSHI_CREDIT_ABI,
    wallet
);

const marketplaceContract = new ethers.Contract(
    process.env.VANSHI_MARKETPLACE_ADDRESS || "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    VANSHI_MARKETPLACE_ABI,
    wallet
);

const usdcContract = new ethers.Contract(
    process.env.VANSHI_USDC_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    MockUSDC_ABI,
    wallet
);

async function ensureVillagerHasGas() {
    try {
        const villagerAddress = villagerWallet.address;
        const balance = await provider.getBalance(villagerAddress);
        if (balance < ethers.parseEther("0.1")) {
            console.log(`💸 Funding Villager ${villagerAddress} with 1 ETH for gas...`);
            // Explicit nonce for admin to avoid race conditions
            const nonce = await provider.getTransactionCount(wallet.address, "latest");
            const fundTx = await wallet.sendTransaction({
                to: villagerAddress,
                value: ethers.parseEther("1.0"),
                nonce
            });
            await fundTx.wait();
        }
        return true;
    } catch (e) {
        console.warn("⚠️ Funding villager failed:", e.message);
        return false;
    }
}

exports.createProjectOnChain = async (developerAddress, cap, price, vintage, metadataUrl) => {
    try {
        const priceInWei = ethers.parseUnits(price.toString(), 18);
        const tx = await creditContract.createProject(
            developerAddress,
            cap,
            priceInWei,
            vintage,
            metadataUrl
        );
        const receipt = await tx.wait();

        // Parse ProjectCreated event to get the projectId
        const event = receipt.logs.find(log => {
            try {
                return creditContract.interface.parseLog(log).name === "ProjectCreated";
            } catch (e) {
                return false;
            }
        });

        if (event) {
            const parsedLog = creditContract.interface.parseLog(event);
            const projectId = Number(parsedLog.args[0]);

            // AUTO-APPROVE MARKETPLACE for this project owner (Villager)
            // This ensures the Marketplace can sell the credits later.
            try {
                const villagerAddress = villagerWallet.address;
                console.log(`🔓 Auto-authorizing Marketplace for Villager ${villagerAddress}...`);

                // 0. Ensure Villager has gas money
                await ensureVillagerHasGas();

                const villagerCreditContract = creditContract.connect(villagerWallet);
                const isApproved = await villagerCreditContract.isApprovedForAll(villagerAddress, marketplaceContract.target);
                if (!isApproved) {
                    const nonce = await provider.getTransactionCount(villagerAddress, "latest");
                    const approveTx = await villagerCreditContract.setApprovalForAll(marketplaceContract.target, true, { nonce });
                    await approveTx.wait();
                    console.log("✅ Marketplace authorized by Villager.");
                }
            } catch (authError) {
                console.warn("⚠️ Villager auto-approval failed:", authError.message);
            }

            return projectId;
        }

        return null;
    } catch (error) {
        console.error("Blockchain Create Project Error:", error);
        throw error;
    }
};

exports.mintCreditsOnChain = async (projectId, amount) => {
    try {
        const tx = await creditContract.mintCredits(projectId, amount);
        await tx.wait();
        return true;
    } catch (error) {
        console.error("Blockchain Mint Credits Error:", error);
        throw error;
    }
};

exports.buyCreditsOnChain = async (projectId, amount) => {
    try {
        console.log(`🛒 Buying ${amount} credits on-chain for Project ${projectId}...`);

        // 0. DIAGNOSTIC: Check if USDC contract exists
        const usdcCode = await provider.getCode(usdcContract.target);
        if (usdcCode === "0x") {
            console.error(`❌ CRITICAL: No USDC contract code found at ${usdcContract.target}. Did you redeploy?`);
            throw new Error("USDC contract not found on-chain");
        }

        // 1. Check if we need to approve USDC
        const allowance = await usdcContract.allowance(wallet.address, marketplaceContract.target);

        // Example check: If allowance is low, approve more (e.g., 1 million units)
        // Note: For production, you'd calculate exact totalCost first.
        if (allowance < ethers.parseUnits("1000", 18)) {
            console.log("🔓 Approving Marketplace to spend USDC...");
            const approveTx = await usdcContract.approve(marketplaceContract.target, ethers.MaxUint256);
            await approveTx.wait();
        }

        // 2. FAILSAFE: Ensure Project Owner (Villager) has authorized Marketplace
        try {
            const project = await creditContract.projects(projectId);
            const owner = project.owner;

            if (owner && owner !== ethers.ZeroAddress) {
                const isApproved = await creditContract.isApprovedForAll(owner, marketplaceContract.target);

                if (!isApproved && owner.toLowerCase() === villagerWallet.address.toLowerCase()) {
                    console.log("🔓 Failsafe: Authorizing Marketplace for Villager...");

                    // 1. Ensure Villager has gas money
                    await ensureVillagerHasGas();

                    const villagerCreditContract = creditContract.connect(villagerWallet);

                    // Explicitly get nonce to avoid "Nonce too low" on fast nodes
                    const nonce = await provider.getTransactionCount(villagerWallet.address, "latest");
                    const approveTx = await villagerCreditContract.setApprovalForAll(marketplaceContract.target, true, { nonce });
                    await approveTx.wait();
                }
            }
        } catch (authErr) {
            console.warn("⚠️ Failsafe approval check failed:", authErr.message);
        }

        // 3. Execute Purchase
        // We use the admin wallet as the "Buyer" for this demonstration/centralized backend role
        const tx = await marketplaceContract.buyCredits(projectId, amount);
        const receipt = await tx.wait();

        console.log(`✅ On-chain purchase successful! Tx: ${receipt.hash}`);
        return receipt.hash;
    } catch (error) {
        console.error("Blockchain Buy Credits Error:", error);
        throw error;
    }
};

exports.startEventListener = () => {
    console.log("🚀 Blockchain Event Listener Started...");

    // Using a more stable listener method for ethers v6 + Hardhat polling issues
    provider.on({
        address: marketplaceContract.target,
        topics: [ethers.id("CreditsBought(address,uint256,uint256,uint256,uint256)")]
    }, async (log) => {
        try {
            const parsedLog = marketplaceContract.interface.parseLog(log);
            const [buyer, projectId, amount, totalCost, fee] = parsedLog.args;

            console.log(`🔔 Event Caught: CreditsBought - Buyer: ${buyer}, Project: ${projectId}, Amount: ${amount}`);

            try {
                // 1. Find the Forest and Carbon Asset
                const forest = await ForestLand.findOne({ on_chain_project_id: Number(projectId) });
                if (!forest) {
                    console.warn(`⚠️ Project ${projectId} not found in database.`);
                    return;
                }

                const asset = await CarbonAsset.findOne({ forest_id: forest._id });
                if (!asset) {
                    console.warn(`⚠️ CarbonAsset for forest ${forest._id} not found.`);
                    return;
                }

                // 2. Find or Create the Company
                let company = await Company.findOne({ wallet_address: buyer.toLowerCase() });
                if (!company) {
                    // Check if there's a user with this wallet address
                    const user = await User.findOne({ wallet_address: buyer.toLowerCase() });
                    company = new Company({
                        company_name: user ? user.name : `Company ${buyer.slice(0, 6)}`,
                        industry: "Blockchain Participant",
                        carbon_target_tco2e: 1000,
                        user_id: user ? user._id : forest.owner_user_id, // Fallback to avoid error
                        wallet_address: buyer.toLowerCase()
                    });
                    await company.save();
                }

                // 3. Update Balance
                const balance = await CarbonCreditBalance.findOne({ carbon_id: asset._id });
                if (balance) {
                    balance.sold_credits += Number(amount);
                    balance.remaining_credits -= Number(amount);
                    balance.last_updated = Date.now();
                    await balance.save();
                    console.log(`✅ DB Updated: Balance for Project ${projectId}`);
                }

                // 4. Record Transaction
                const transaction = new Transaction({
                    company_id: company._id,
                    carbon_id: asset._id,
                    credits_purchased: Number(amount),
                    amount_paid_inr: 0, // In a real app, calculate from on-chain price * amount
                    transaction_type: "PURCHASE",
                    ledger_type: "BLOCKCHAIN_EVENT",
                    status: "COMPLETED"
                });
                await transaction.save();
                console.log(`✅ DB Updated: Transaction recorded for Buyer ${buyer}`);

            } catch (error) {
                console.error("❌ Event Processor Error:", error);
            }
        } catch (error) {
            console.error("❌ Log Parsing/Processing Error:", error);
        }
    });
};
