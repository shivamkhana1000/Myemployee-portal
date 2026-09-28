import dotenv from 'dotenv';
dotenv.config();

import pool from './pool';

async function dropAndMigrate() {
  try {
    await pool.query('DROP TABLE IF EXISTS gamba_members CASCADE;');
    await pool.query('DROP TABLE IF EXISTS gamba_projects CASCADE;');
    console.log('Tables dropped.');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

dropAndMigrate();
