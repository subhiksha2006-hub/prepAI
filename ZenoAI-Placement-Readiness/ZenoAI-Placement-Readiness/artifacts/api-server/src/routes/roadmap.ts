import { Router } from 'express';
import { store, type RoadmapTask } from '../data/store';

const router = Router();

router.get('/roadmap', (_req, res) => {
  store.recalculateReadiness();
  const completed = store.tasks.filter((t) => t.done).length;
  res.json({
    tasks: store.tasks,
    completedCount: completed,
    totalCount: store.tasks.length,
    completionPercentage: Math.round((completed / store.tasks.length) * 100),
  });
});

router.post('/roadmap/task/:id/toggle', (req, res) => {
  const taskId = Number(req.params.id);
  const task = store.tasks.find((t) => t.id === taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  task.done = !task.done;
  store.recalculateReadiness();

  // Update associated category score dynamically
  const cat = store.categories.find((c) => c.name === task.category);
  if (cat) {
    cat.score = Math.min(100, Math.max(20, cat.score + (task.done ? 3 : -3)));
  }

  res.json({
    success: true,
    task,
    tasks: store.tasks,
    overallReadiness: store.profile.overallReadiness,
  });
});

router.post('/roadmap/task', (req, res) => {
  const { title, category, time, priority, rationale } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const newTask: RoadmapTask = {
    id: Date.now(),
    title,
    category: category || 'Coding',
    meta: `${category || 'Coding'} · ${priority || 'priority 05'}`,
    time: time || '30 min',
    priority: priority || 'Priority 05',
    done: false,
    rationale: rationale || 'AI suggested task based on placement gaps.',
  };

  store.tasks.push(newTask);
  store.recalculateReadiness();
  res.status(201).json({ success: true, task: newTask, tasks: store.tasks });
});

export default router;
