const { pool } = require("../config/db");

async function getAlliance(playerId) {
  const res = await pool.query(
    `SELECT a.id, a.name, a.bonus_income_pct, a.bonus_influence_pct
     FROM players p
     LEFT JOIN alliances a ON a.id = p.alliance_id
     WHERE p.id = $1`,
    [playerId]
  );
  return res.rows[0] || null;
}

async function createAlliance({ playerId, name }) {
  const res = await pool.query(
    `INSERT INTO alliances (name, owner_player_id)
     VALUES ($1, $2)
     RETURNING id, name, bonus_income_pct, bonus_influence_pct`,
    [name, playerId]
  );

  await pool.query(
    "UPDATE players SET alliance_id = $1 WHERE id = $2",
    [res.rows[0].id, playerId]
  );

  return res.rows[0];
}

async function joinAlliance({ playerId, allianceId }) {
  await pool.query(
    "UPDATE players SET alliance_id = $1 WHERE id = $2",
    [allianceId, playerId]
  );
}

async function leaveAlliance(playerId) {
  await pool.query("UPDATE players SET alliance_id = NULL WHERE id = $1", [playerId]);
}

module.exports = {
  getAlliance,
  createAlliance,
  joinAlliance,
  leaveAlliance
};
