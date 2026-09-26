import { Router } from 'express';
import { store } from '../data/store';

const router = Router();

router.get('/skills', (_req, res) => {
  res.json({
    categories: store.categories,
    criticalGaps: store.categories
      .filter((c) => c.status === 'critical_gap' || c.score < 60)
      .map((c) => ({
        category: c.name,
        score: c.score,
        gaps: c.skills.filter((s) => s.status === 'gap'),
      })),
  });
});

export default router;
