const pool = require('../db');

// ✅ Add a new emergency contact
const addContact = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, number, description } = req.body;

    const result = await pool.query(
      `INSERT INTO emergency_contacts (user_id, contact_name, contact_phone, contact_relationship)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, name, number, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Insert Error:", err);
    res.status(500).json({ error: 'Failed to add contact' });
  }
};

// ✅ Get all emergency contacts for a user
const getContacts = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT id, contact_name AS name, contact_phone AS number, contact_relationship AS description
       FROM emergency_contacts
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.status(200).json({ contacts: result.rows });
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
};

// ✅ Delete a specific contact
const deleteContact = async (req, res) => {
  try {
    const { contactId } = req.params;

    await pool.query('DELETE FROM emergency_contacts WHERE id = $1', [contactId]);
    res.status(200).json({ message: 'Contact deleted successfully' });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
};

// ✅ Update a specific contact (optional feature)
const updateContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const { contact_name, contact_phone, contact_relationship } = req.body;

    const result = await pool.query(
      `UPDATE emergency_contacts 
       SET contact_name = $1, contact_phone = $2, contact_relationship = $3, updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [contact_name, contact_phone, contact_relationship, contactId]
    );

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ error: 'Failed to update contact' });
  }
};

// ✅ Export all functions
module.exports = {
  addContact,
  getContacts,
  deleteContact,
  updateContact,
};
