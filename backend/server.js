const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const authRoutes = require("./routes/authRoutes");
const forestRoutes = require("./routes/forestRoutes");
const carbonRoutes = require("./routes/carbonRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const companyRoutes = require("./routes/companyRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { startEventListener } = require("./services/blockchainService");

dotenv.config();

const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Request Logger Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.method === 'POST') {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/forests", forestRoutes);
app.use("/api/carbon", carbonRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/admin", adminRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR HANDLER:", err);
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: "Invalid JSON in request body" });
  }
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/vanshi";

const User = require("./models/User");
const Settings = require("./models/Settings");

async function seedAdmin() {
  try {
    const adminExists = await User.findOne({ email: "admin@gmail.com" });
    if (!adminExists) {
      const admin = new User({
        name: "Super Admin",
        email: "admin@gmail.com",
        password: "admin123",
        role: "ADMIN"
      });
      await admin.save();
      console.log("✅ Admin user seeded: admin@gmail.com / admin123");
    }

    const settingsExists = await Settings.findOne();
    if (!settingsExists) {
      const defaultSettings = new Settings({
        price_per_credit: 952,
        base_rates: {
          broadleaf: 30,
          mixed: 28,
          pine: 24,
          degraded: 20
        }
      });
      await defaultSettings.save();
      console.log("✅ Default ESG settings seeded");
    }
  } catch (err) {
    console.error("❌ Seeding Error:", err);
  }
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    seedAdmin();
    startEventListener(); // Start watching for on-chain events
  })
  .catch(err => console.log("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("VANSHI API is running...");
});

app.listen(PORT, () => {
  console.log("========================================");
  console.log(`SERVER VERSION: 2.2 (DYNAMIC SETTINGS)`);
  console.log(`Server running on port ${PORT}`);
  console.log("========================================");
});
