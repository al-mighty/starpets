import { Request, Response } from 'express';
import { taskService } from '../services/TaskService';

export class TaskController {
  async getTasks(req: Request, res: Response) {
    try {
      const tasks = await taskService.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  }
}

export const taskController = new TaskController();
