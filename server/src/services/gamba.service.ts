import pool from '../db/pool';
import { validateGambaTransition } from '../lib/business-rules';
import type { GambaProject, CreateGambaInput, UpdateGambaInput, GambaSummary } from '../types/gamba.types';

// validateGambaTransition is now imported from ../lib/business-rules (shared with tests)

export async function createProject(employeeId: number, input: CreateGambaInput): Promise<GambaProject> {
  if (input.status !== 'draft' && input.status !== 'submitted') {
    throw new Error('Initial status must be draft or submitted');
  }

  const result = await pool.query<GambaProject>(
    `INSERT INTO gamba_projects (
      employee_id, title, department, improvement_area, problem_statement, 
      current_situation, root_cause, proposed_solution, expected_benefits, 
      team_members, estimated_cost, actual_savings, productivity_improvement, status
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
    ) RETURNING *`,
    [
      employeeId, input.title, input.department, input.improvement_area, input.problem_statement,
      input.current_situation, input.root_cause, input.proposed_solution, input.expected_benefits,
      JSON.stringify(input.team_members || []), input.estimated_cost, input.actual_savings, 
      input.productivity_improvement, input.status
    ]
  );
  return result.rows[0];
}

export async function listProjects(filters: { employeeId?: number; status?: string; department?: string }): Promise<GambaSummary[]> {
  let query = `
    SELECT g.*, u.name as employee_name
    FROM gamba_projects g
    JOIN users u ON g.employee_id = u.id
    WHERE 1=1
  `;
  const values: unknown[] = [];
  let paramIndex = 1;

  if (filters.employeeId) {
    query += ` AND g.employee_id = $${paramIndex++}`;
    values.push(filters.employeeId);
  }
  if (filters.status) {
    query += ` AND g.status = $${paramIndex++}`;
    values.push(filters.status);
  }
  if (filters.department) {
    query += ` AND g.department = $${paramIndex++}`;
    values.push(filters.department);
  }

  query += ` ORDER BY g.created_at DESC`;

  const result = await pool.query<GambaSummary>(query, values);
  return result.rows;
}

export async function getProjectById(id: number, employeeId?: number): Promise<GambaSummary | null> {
  const result = await pool.query<GambaSummary>(
    `SELECT g.*, u.name as employee_name
     FROM gamba_projects g
     JOIN users u ON g.employee_id = u.id
     WHERE g.id = $1`,
    [id]
  );
  
  if (result.rows.length === 0) return null;
  const project = result.rows[0];

  // If employeeId is provided (not a manager), ensure they own it
  if (employeeId && project.employee_id !== employeeId) {
    throw new Error('Access denied: You do not have permission to view this project');
  }

  return project;
}

export async function updateProject(id: number, role: 'employee' | 'manager', userId: number, input: UpdateGambaInput): Promise<GambaProject> {
  const project = await getProjectById(id);
  if (!project) throw new Error('Project not found');

  if (role === 'employee' && project.employee_id !== userId) {
    throw new Error('Access denied: You can only update your own projects');
  }

  // Employee edit restriction: only in DRAFT or CHANGES_REQUESTED
  // (Unless they are just changing status to submitted)
  const isEditingFields = Object.keys(input).some(k => k !== 'status');
  if (role === 'employee' && isEditingFields && !['draft', 'changes_requested'].includes(project.status)) {
    throw new Error('Access denied: Projects can only be edited when in Draft or Changes Requested status');
  }

  // Enforce status transitions
  if (input.status) {
    validateGambaTransition(role, project.status, input.status);
  }

  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  // Dynamically build the update query
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) {
      updates.push(`${key} = $${paramIndex++}`);
      // Handle array conversion for team_members
      values.push(key === 'team_members' ? JSON.stringify(value) : value);
    }
  }

  if (updates.length === 0) return project;

  // Handle manager comment explicitly if provided (even if status didn't change, e.g. updating the comment on changes requested)
  if (input.manager_comment !== undefined && role === 'manager') {
      if(!updates.includes(`manager_comment = $${paramIndex-1}`)) {
          updates.push(`manager_comment = $${paramIndex++}`);
          values.push(input.manager_comment);
      }
  }
  
  // Enforce manager_comment requirement when requesting changes
  if (input.status === 'changes_requested' && !input.manager_comment && !project.manager_comment) {
      throw new Error('A reason (manager comment) is required when requesting changes.');
  }

  values.push(id);
  const query = `
    UPDATE gamba_projects
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await pool.query<GambaProject>(query, values);
  return result.rows[0];
}
