import { Request, Response } from 'express';
import { getManagerDashboard, getEmployeeDashboard } from '../services/dashboard.service';

// GET /api/dashboard/manager
export async function managerDashboardHandler(req: Request, res: Response): Promise<void> {
  try {
    const data = await getManagerDashboard();
    res.status(200).json({ success: true, ...data });
  } catch (err) {
    console.error('[dashboard] manager error:', (err as Error).message);
    res.status(500).json({ success: false, message: 'Failed to load manager dashboard' });
  }
}

// GET /api/dashboard/employee
export async function employeeDashboardHandler(req: Request, res: Response): Promise<void> {
  try {
    const data = await getEmployeeDashboard(req.user!.userId);
    res.status(200).json({ success: true, ...data });
  } catch (err) {
    console.error('[dashboard] employee error:', (err as Error).message);
    res.status(500).json({ success: false, message: 'Failed to load employee dashboard' });
  }
}
