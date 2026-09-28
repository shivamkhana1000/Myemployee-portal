import { Request, Response } from 'express';
import * as solutionService from '../services/solution.service';

export async function searchSolutions(req: Request, res: Response): Promise<void> {
  try {
    const q = req.query.q as string;
    const solutions = await solutionService.searchSolutions(q || '');
    res.json({ success: true, solutions });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
}
