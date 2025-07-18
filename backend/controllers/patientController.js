const pool = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const JWT_SECRET = process.env.JWT_SECRET;

// SIGNUP
exports.registeruser = async (req, res) => {
  const { first_name, last_name, email, password, dob } = req.body;

  if (!first_name || !last_name || !email || !password || !dob) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const normalizedEmail = email.toLowerCase();

  try {
    const existingUser = await pool.query(
      "SELECT * FROM patients WHERE email = $1",
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO patients 
        (first_name, last_name, email, password, dob, profile_completed) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, email, profile_completed`,
      [first_name, last_name, normalizedEmail, hashedPassword, dob, false]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      token,
      userId: user.id,
      profileCompleted: user.profile_completed,
    });

  } catch (error) {
    console.error("🔥 Signup error:", error.message);
    res.status(500).json({ message: "Server error during signup" });
  }
};

// LOGIN
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM patients WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const profileCompleted = user.profile_completed;

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      user: {
        ...userWithoutPassword,
        profileCompleted,
      },
      token,
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(401).json({ message: "Invalid credentials" });
  }
};

// ✅ COMPLETE SETUP
exports.completeSetup = async (req, res) => {
  console.log("🚨 COMPLETESETUP FUNCTION CALLED!");
  console.log("🔍 RAW REQUEST DATA:");
  console.log("  - req.url:", req.url);
  console.log("  - req.originalUrl:", req.originalUrl);
  console.log("  - req.params:", req.params);
  console.log("  - req.params.userId:", req.params.userId);

  const { userId } = req.params;
  const {
    lastMenstrualPeriod,
    firstPregnancy,
    healthConditions,
    otherCondition
  } = req.body;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    // Insert into pregnancy_profiles
    await pool.query(
      `INSERT INTO pregnancy_profiles 
        (user_id, last_menstrual_period, first_pregnancy, health_conditions, other_condition, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        userId,
        lastMenstrualPeriod,
        firstPregnancy,
        JSON.stringify(healthConditions),
        otherCondition
      ]
    );

    // Update patients table
    await pool.query(
      'UPDATE patients SET profile_completed = $1 WHERE id = $2',
      [true, userId]
    );

    res.status(201).json({ message: 'Setup completed and saved ✅' });
  } catch (error) {
    console.error('❌ Setup error:', error);
    res.status(500).json({ error: 'Setup failed' });
  }
};



// ✅ GET PROFILE
exports.getProfile = async (req, res) => {
  const { userId } = req.params;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const result = await pool.query(
      `SELECT p.first_name, p.last_name, p.dob, 
              pp.last_menstrual_period, pp.first_pregnancy, 
              pp.health_conditions, pp.other_condition
       FROM patients p
       LEFT JOIN pregnancy_profiles pp ON p.id = pp.user_id
       WHERE p.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error during profile fetch' });
  }
};

// ✅ GET ALL PATIENTS
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await pool.query(
      'SELECT id, first_name, last_name, email, profile_picture FROM patients'
    );

    const users = patients.rows.map(p => ({
      id: p.id,
      name: `${p.first_name} ${p.last_name}`,
      avatar: p.profile_picture || null,
      email: p.email,
      online: true // update this if you track presence
    }));

    res.json(users);
  } catch (err) {
    console.error('Get all patients error:', err);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
};
