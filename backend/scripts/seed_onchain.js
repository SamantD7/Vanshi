const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load Environment Variables
dotenv.config({ path: path.join(__dirname, "../.env") });

// Models
const User = require("../models/User");
const ForestLand = require("../models/ForestLand");
const CarbonAsset = require("../models/CarbonAsset");
const CarbonCreditBalance = require("../models/CarbonCreditBalance");
const Settings = require("../models/Settings");

// Blockchain Service
const { createProjectOnChain, mintCreditsOnChain, villagerWallet } = require("../services/blockchainService");

async function seed() {
    try {
        console.log("🚀 Starting On-Chain Ready Seeding...");

        // 1. Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log("✅ MongoDB Connected");

        // 2. Ensure we have a Villager User
        // Wipe old test user if it has the wrong address
        const correctAddress = villagerWallet.address;
        console.log(`🔎 Target Villager Address: ${correctAddress}`);

        let villager = await User.findOne({ email: "villager_test@gmail.com" });
        if (villager && villager.wallet_address.toLowerCase() !== correctAddress.toLowerCase()) {
            console.log("🗑️ Deleting old test villager with incorrect address...");
            await User.deleteOne({ _id: villager._id });
            villager = null;
        }

        if (!villager) {
            villager = new User({
                name: "Test Villager",
                email: "villager_test@gmail.com",
                password: "password123",
                role: "VILLAGE",
                wallet_address: correctAddress
            });
            await villager.save();
            console.log("✅ Created Test Villager with correct address");
        }

        // 3. Register a New Forest
        const forest = new ForestLand({
            village_name: "Seed Forest " + Date.now().toString().slice(-4),
            district: "Gadchiroli",
            state: "Maharashtra",
            forest_area_ha: 50,
            forest_type: "Broadleaf",
            location: { latitude: 19.45, longitude: 80.21 },
            owner_user_id: villager._id,
            status: "VERIFIED" // We skip PENDING since this is a fast-track seed
        });
        await forest.save();
        console.log("✅ Registered Verified Forest");

        // 4. Create On-Chain Project
        console.log("🔗 Creating Blockchain Project...");
        const projectId = await createProjectOnChain(
            villager.wallet_address,
            5000,           // Cap
            952,            // Price
            2024,           // Vintage
            `ipfs://seed-${forest._id}`
        );

        if (projectId !== null) {
            forest.on_chain_project_id = projectId;
            await forest.save();
            console.log(`✅ Project ${projectId} created on-chain`);
        } else {
            throw new Error("Blockchain project creation failed");
        }

        // 5. Calculate & Mint Credits
        const totalCarbon = 50 * 12.5; // Dummy calculation (Area * 12.5)

        const carbonAsset = new CarbonAsset({
            forest_id: forest._id,
            total_carbon_tco2e: totalCarbon,
            carbon_rate: 952, // Using the same price
            total_value_inr: Math.floor(totalCarbon * 952)
        });
        await carbonAsset.save();

        const balance = new CarbonCreditBalance({
            carbon_id: carbonAsset._id,
            issued_credits: Math.floor(totalCarbon),
            remaining_credits: Math.floor(totalCarbon)
        });
        await balance.save();
        console.log(`✅ Asset activated in DB with ${Math.floor(totalCarbon)} credits`);

        // 6. Mint on blockchain
        console.log("🪙 Minting credits on-chain...");
        await mintCreditsOnChain(projectId, Math.floor(totalCarbon));
        console.log("✅ Credits minted on-chain");

        console.log("\n--- SEEDING COMPLETE ---");
        console.log("Email: villager_test@gmail.com");
        console.log("Forest ID:", forest._id);
        console.log("Project ID:", projectId);
        console.log("Credits Available:", Math.floor(totalCarbon));

        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding Failed:", error);
        process.exit(1);
    }
}

seed();
