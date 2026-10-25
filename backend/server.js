const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());

require("dotenv").config();
const jwt = require("jsonwebtoken");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "caredirect",
});

app.get("/plans", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM service_categories");
  res.json(rows);
});

app.get("/rooms", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM rooms");
  res.json(rows);
});

app.post("/register", async (req, res) => {
  try {
    const { full_name, email, phone, password, role } = req.body;

    if (!full_name || !email || !password || !role) {
      return res
        .status(400)
        .json({ error: "Please fill in all required fields" });
    }

    const allowedRoles = ["resident", "guardian"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }

    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);
    if (existing.length > 0) {
      return res
        .status(409)
        .json({ error: "This email is already registered" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)",
      [full_name, email, phone || null, password_hash, role],
    );

    res.status(201).json({ message: "Account created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong, please try again" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Please enter your email and password" });
    }

    const [rows] = await db.query(
      "SELECT id, full_name, email, role, password_hash, status FROM users WHERE email = ?",
      [email],
    );

    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: "Incorrect email or password" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Incorrect email or password" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ error: "This account is inactive" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong, please try again" });
  }
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
