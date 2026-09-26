import { Router } from 'express';
import { store } from '../data/store';

const router = Router();

router.get('/targets', (_req, res) => {
  res.json({
    targets: store.targets,
    selectedTargetIndex: store.profile.targetCompanyIndex,
  });
});

router.get('/targets/:id', (req, res) => {
  const target = store.targets.find((t) => t.id === req.params.id);
  if (!target) {
    return res.status(404).json({ error: 'Target not found' });
  }
  res.json(target);
});

export default router;
