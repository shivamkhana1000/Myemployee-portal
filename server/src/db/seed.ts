/**
 * seed.ts
 * Populates the database with development / test data.
 * Run AFTER migrate.ts:  npm run db:seed
 *
 * Passwords are hashed here at runtime (not stored as plaintext in SQL).
 * All seed rows use ON CONFLICT … DO NOTHING so the script is idempotent —
 * safe to re-run without duplicating rows.
 *
 * Seed credentials (dev only — never use in production):
 *   EMP001  password: Employee@123   role: employee   dept: IT
 *   EMP002  password: Employee@123   role: employee   dept: Engineering
 *   EMP003  password: Employee@123   role: employee   dept: Production
 *   MGR001  password: Manager@123    role: manager    dept: IT
 *   MGR002  password: Manager@123    role: manager    dept: Engineering
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { Client } from 'pg';
import bcrypt from 'bcryptjs';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const SALT_ROUNDS = 10;

// ---------------------------------------------------------------------------
// Seed definitions
// ---------------------------------------------------------------------------

interface SeedUser {
  employee_id: string;
  password: string;
  name: string;
  role: 'employee' | 'manager';
  department_name: string;
}

const SEED_USERS: SeedUser[] = [
  { employee_id: 'EMP001', password: 'Employee@123', name: 'John Smith',    role: 'employee', department_name: 'Information Technology' },
  { employee_id: 'EMP002', password: 'Employee@123', name: 'Sarah Johnson', role: 'employee', department_name: 'Engineering'            },
  { employee_id: 'EMP003', password: 'Employee@123', name: 'Carlos Rivera', role: 'employee', department_name: 'Production'             },
  { employee_id: 'MGR001', password: 'Manager@123',  name: 'David Wilson',  role: 'manager',  department_name: 'Information Technology' },
  { employee_id: 'MGR002', password: 'Manager@123',  name: 'Lisa Chen',     role: 'manager',  department_name: 'Engineering'            },
];

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

async function seed(): Promise<void> {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    console.log('[seed] Connected to PostgreSQL');

    // 1. Run static seed SQL (departments + historical_solutions)
    const seedSqlPath = path.join(__dirname, 'seed.sql');
    const staticSql = fs.readFileSync(seedSqlPath, 'utf-8');
    await client.query(staticSql);
    console.log('[seed] Static SQL (departments, historical_solutions) inserted');

    // 2. Insert users with bcrypt-hashed passwords
    for (const user of SEED_USERS) {
      const hash = await bcrypt.hash(user.password, SALT_ROUNDS);

      // Look up the department PK by name so we don't hard-code IDs
      const deptResult = await client.query<{ id: number }>(
        'SELECT id FROM departments WHERE name = $1',
        [user.department_name]
      );

      if (deptResult.rowCount === 0) {
        console.warn(`[seed] Department not found: "${user.department_name}" — skipping ${user.employee_id}`);
        continue;
      }

      const departmentId = deptResult.rows[0].id;

      await client.query(
        `INSERT INTO users (employee_id, password_hash, name, role, department_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (employee_id) DO NOTHING`,
        [user.employee_id, hash, user.name, user.role, departmentId]
      );

      console.log(`[seed]   ✔ ${user.employee_id} (${user.role}) — ${user.name}`);
    }

    console.log('[seed] ✅ Database seeded successfully');
    console.log('[seed]');
    console.log('[seed] Test credentials:');
    console.log('[seed]   Employee — any EMP00x / Employee@123');
    console.log('[seed]   Manager  — any MGR00x / Manager@123');
  } catch (err) {
    console.error('[seed] ❌ Seed failed:', (err as Error).message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
