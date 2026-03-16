const { pool } = require("../config/db");

async function getEconomyStatus(playerId) {
  const balanceRes = await pool.query(
    "SELECT money, influence_points, alliance_id FROM players WHERE id = $1",
    [playerId]
  );
  const player = balanceRes.rows[0];

  const districtRes = await pool.query(
    "SELECT COALESCE(SUM(base_income), 0) AS income FROM districts WHERE owner_player_id = $1",
    [playerId]
  );

  let income = Number(districtRes.rows[0].income);

  if (player.alliance_id) {
    const allianceRes = await pool.query(
      "SELECT bonus_income_pct FROM alliances WHERE id = $1",
      [player.alliance_id]
    );
    const bonusPct = allianceRes.rows[0]?.bonus_income_pct || 0;
    income = Math.floor(income * (1 + bonusPct / 100));
  }

  return {
    balance: Number(player.money),
    incomePerHour: income,
    influence: Number(player.influence_points)
  };
}

module.exports = { getEconomyStatus };
