export type GambaStatus = 
  | 'draft' 
  | 'submitted' 
  | 'under_review' 
  | 'changes_requested' 
  | 'approved' 
  | 'implemented' 
  | 'completed';

export interface GambaProject {
  id: number;
  employee_id: number;
  title: string;
  department: string;
  improvement_area: string;
  problem_statement: string;
  current_situation: string;
  root_cause: string;
  proposed_solution: string;
  expected_benefits: string;
  team_members: string[]; // JSON array in DB
  estimated_cost: number | null;
  actual_savings: number | null;
  productivity_improvement: string | null;
  status: GambaStatus;
  manager_comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface GambaSummary extends GambaProject {
  employee_name: string;
}

export interface CreateGambaInput {
  title: string;
  department: string;
  improvement_area: string;
  problem_statement: string;
  current_situation: string;
  root_cause: string;
  proposed_solution: string;
  expected_benefits: string;
  team_members: string[];
  estimated_cost?: number;
  actual_savings?: number;
  productivity_improvement?: string;
  status: 'draft' | 'submitted'; // Only allowed initial statuses
}

export interface UpdateGambaInput {
  title?: string;
  department?: string;
  improvement_area?: string;
  problem_statement?: string;
  current_situation?: string;
  root_cause?: string;
  proposed_solution?: string;
  expected_benefits?: string;
  team_members?: string[];
  estimated_cost?: number;
  actual_savings?: number;
  productivity_improvement?: string;
  status?: GambaStatus;
  manager_comment?: string;
}
