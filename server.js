// server.js
const bcrypt = require("bcrypt");

const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send("Backend is live!");
});


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose
  .connect(
    "mongodb+srv://bhendekargaurav2004:FnT6V9lAhnMYTuit@cluster0.ckxtusc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB:", err)); // Add error handling for connection

const fs = require("fs");

const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

const Vendor = mongoose.model(
  "Vendor",
  new mongoose.Schema({
    vendor_name: String,
    email: String,
    password: String,
    personal_address: String,
    shop_address: String,
    shop_name: String,
    fax: String,
    profile_photo: String,
    fssai_certificate: String,
  })
);

// Registration endpoint (unchanged)
app.post(
  "/register",
  upload.fields([
    { name: "profile_photo", maxCount: 1 },
    { name: "fssai_certificate", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      if (
        !req.files ||
        !req.files["profile_photo"] ||
        !req.files["profile_photo"][0] ||
        !req.files["fssai_certificate"] ||
        !req.files["fssai_certificate"][0]
      ) {
        return res.status(400).send({ error: "Profile photo and FSSAI certificate are required." });
      }

      const vendor = new Vendor({
        ...req.body,
        password: hashedPassword,
        profile_photo: req.files["profile_photo"][0].filename,
        fssai_certificate: req.files["fssai_certificate"][0].filename,
      });

      await vendor.save();
      res.status(200).send({ message: "Registered successfully!" });
    } catch (err) {
      console.error("Registration error:", err); // Log the detailed error
      res.status(500).send({ error: err.message });
    }
  }
);

// NEW: Login endpoint (with added debug logs)
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`[LOGIN] Attempting login for email: ${email}`); // Debug log

    // Basic validation
    if (!email || !password) {
      console.log("[LOGIN] Email or password missing."); // Debug log
      return res.status(400).json({ error: "Email and password are required." });
    }

    // Find the vendor by email
    const vendor = await Vendor.findOne({ email });
    console.log(`[LOGIN] Vendor found: ${vendor ? 'Yes' : 'No'}`); // Debug log

    // Check if vendor exists
    if (!vendor) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Compare provided password with hashed password in DB
    console.log("[LOGIN] Comparing passwords..."); // Debug log
    const isMatch = await bcrypt.compare(password, vendor.password);
    console.log(`[LOGIN] Password match result: ${isMatch}`); // Debug log

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // If credentials are correct, send success response
    console.log("[LOGIN] Login successful!"); // Debug log
    res.status(200).json({
      message: "Login successful!",
      user: {
        email: vendor.email,
        vendor_name: vendor.vendor_name,
        // You might send more user data here, but avoid sending sensitive info like the hashed password
      },
    });
  } catch (err) {
    console.error("Login error (SERVER-SIDE):", err); // Log the detailed error
    res.status(500).json({ error: "Server error during login." });
  }
});

// Vendor info endpoint (unchanged)
app.post('/vendor-info', async (req, res) => {
  const { email } = req.body;

  try {
    const vendor = await Vendor.findOne({ email }); // or _id if using login sessions
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    res.json({
      name: vendor.vendor_name,
      role: "Vendor",
      email: vendor.email,
      photo: "/uploads/" + vendor.profile_photo // or base64 if stored that way
    });
  } catch (err) {
    console.error("Vendor info error:", err); // Log server errors for this endpoint too
    res.status(500).json({ error: 'Server error' });
  }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Handle unhandled promise rejections and uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
