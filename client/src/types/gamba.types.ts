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
  team_members: string[];
  estimated_cost: number | null;
  actual_savings: number | null;
  productivity_improvement: string | null;
  status: GambaStatus;
  manager_comment: string | null;
  created_at: string;
  updated_at: string;
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
  status: 'draft' | 'submitted';
}

export interface UpdateGambaInput extends Partial<Omit<CreateGambaInput, 'status'>> {
  status?: GambaStatus;
  manager_comment?: string;
}
