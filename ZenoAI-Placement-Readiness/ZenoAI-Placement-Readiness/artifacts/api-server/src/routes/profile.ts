import { Router } from 'express';
import { store } from '../data/store';

const router = Router();

router.get('/profile', (_req, res) => {
  store.recalculateReadiness();
  res.json({
    profile: store.profile,
    target: store.targets[store.profile.targetCompanyIndex] || store.targets[0],
    summary: {
      completedTasks: store.tasks.filter((t) => t.done).length,
      totalTasks: store.tasks.length,
      evaluationsCount: store.evaluations.length,
    },
  });
});

router.patch('/profile/target', (req, res) => {
  const { targetIndex } = req.body;
  if (typeof targetIndex === 'number' && targetIndex >= 0 && targetIndex < store.targets.length) {
    store.profile.targetCompanyIndex = targetIndex;
    store.recalculateReadiness();
    res.json({ success: true, profile: store.profile, target: store.targets[targetIndex] });
  } else {
    res.status(400).json({ error: 'Invalid targetIndex provided' });
  }
});

export default router;
