const pool = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const JWT_SECRET = process.env.JWT_SECRET;

// ✅ REGISTER USER
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

// ✅ LOGIN USER
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

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      user: {
        ...userWithoutPassword,
        profileCompleted: user.profile_completed,
      },
      token,
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: "Server error during login" });
  }
};

// ✅ COMPLETE PROFILE SETUP
exports.completeSetup = async (req, res) => {
  const { userId } = req.params;
  const {
    lastMenstrualPeriod,
    firstPregnancy
  } = req.body;

  if (!userId || !lastMenstrualPeriod || typeof firstPregnancy === "undefined") {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await pool.query(
      `INSERT INTO pregnancy_profiles 
        (user_id, last_menstrual_period, first_pregnancy, created_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (user_id) DO UPDATE SET 
          last_menstrual_period = EXCLUDED.last_menstrual_period,
          first_pregnancy = EXCLUDED.first_pregnancy;`,
      [userId, lastMenstrualPeriod, firstPregnancy]
    );

    await pool.query(
      'UPDATE patients SET profile_completed = $1 WHERE id = $2',
      [true, userId]
    );

    res.status(200).json({ message: 'Setup completed successfully' });
  } catch (error) {
    console.error('❌ Error saving setup:', error);
    res.status(500).json({ error: 'Server error during setup' });
  }
};

// ✅ GET PATIENT PROFILE
exports.getProfile = async (req, res) => {
  const { userId } = req.params;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const result = await pool.query(
      `SELECT p.first_name, p.last_name, p.dob, 
              pp.last_menstrual_period, pp.first_pregnancy
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
    console.error('❌ Get profile error:', error);
    res.status(500).json({ error: 'Server error during profile fetch' });
  }
};

// ✅ GET ALL USERS FOR NEW CHAT SCREEN
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await pool.query(
      'SELECT id, first_name, last_name FROM patients'
    );

    const users = patients.rows
      .map(p => ({
        id: p.id,
        name: `${p.first_name} ${p.last_name}`,
        avatar: null, // fallback to initials in frontend
        online: true
      }))
      .sort((a, b) => a.name.localeCompare(b.name)); // sort alphabetically

    res.json(users);
  } catch (err) {
    console.error('Get all patients error:', err);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
};

exports.getProfile = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      "SELECT trimester, due_date FROM pregnancy_profiles WHERE user_id = $1",
      [userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
