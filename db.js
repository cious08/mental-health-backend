import mysql from "mysql2/promise";

// Gagamitin natin ang wellness_db na ginawa mo sa XAMPP kanina
export const db = {
  pool: mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '', // Karaniwang walang password ang XAMPP
    database: 'wellness_db', // SIGURADUHIN na 'wellness_db' ito
    waitForConnections: true,
    connectionLimit: 10
  }),

  // Ito ang magpapatakbo ng SQL commands mo
  async query(sql, params) {
    return await this.pool.execute(sql, params);
  }
};