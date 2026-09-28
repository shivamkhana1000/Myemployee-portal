import { Request, Response } from 'express';
import * as gambaService from '../services/gamba.service';
import type { CreateGambaInput, UpdateGambaInput } from '../types/gamba.types';

export async function createGamba(req: Request, res: Response): Promise<void> {
  try {
    const input: CreateGambaInput = req.body;
    const project = await gambaService.createProject(req.user!.userId, input);
    res.status(201).json({ success: true, project });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
}

export async function listGamba(req: Request, res: Response): Promise<void> {
  try {
    const filters: {
      status?: string;
      department?: string;
      employeeId?: number;
    } = {
      status: req.query.status as string,
      department: req.query.department as string,
    };

    // Employees only see their own projects
    if (req.user!.role === 'employee') {
      filters.employeeId = req.user!.userId;
    }

    const projects = await gambaService.listProjects(filters);
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
}

export async function getGamba(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const employeeId = req.user!.role === 'employee' ? req.user!.userId : undefined;
    
    const project = await gambaService.getProjectById(id, employeeId);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }
    
    res.json({ success: true, project });
  } catch (err) {
    res.status(403).json({ success: false, message: (err as Error).message });
  }
}

export async function updateGamba(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const input: UpdateGambaInput = req.body;
    
    const project = await gambaService.updateProject(id, req.user!.role, req.user!.userId, input);
    res.json({ success: true, project });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
}
