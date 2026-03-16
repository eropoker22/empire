const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

async function registerPlayer({ username, password, gangName }) {
  const passwordHash = await bcrypt.hash(password, 12);

  const result = await pool.query(
    `INSERT INTO players (username, password_hash, gang_name)
     VALUES ($1, $2, $3)
     RETURNING id, username, gang_name, gang_structure`,
    [username, passwordHash, gangName]
  );

  const player = result.rows[0];
  return createToken(player);
}

async function loginPlayer({ username, password }) {
  const result = await pool.query(
    "SELECT id, username, gang_name, gang_structure, password_hash FROM players WHERE username = $1",
    [username]
  );

  if (result.rowCount === 0) {
    return null;
  }

  const player = result.rows[0];
  const ok = await bcrypt.compare(password, player.password_hash);
  if (!ok) return null;

  return createToken(player);
}

function createToken(player) {
  return jwt.sign(
    {
      id: player.id,
      username: player.username,
      gangName: player.gang_name,
      structure: player.gang_structure || null
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

module.exports = {
  registerPlayer,
  loginPlayer,
  createToken
};
