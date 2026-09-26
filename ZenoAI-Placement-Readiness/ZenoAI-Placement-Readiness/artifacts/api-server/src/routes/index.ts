import { Router } from 'express';
import profileRouter from './profile';
import targetsRouter from './targets';
import skillsRouter from './skills';
import roadmapRouter from './roadmap';
import interviewRouter from './interview';

const router = Router();

router.get('/healthz', (_req, res) => {
  res.json({ status: 'ok', service: 'prep-ai-api-server', timestamp: new Date().toISOString() });
});

router.use(profileRouter);
router.use(targetsRouter);
router.use(skillsRouter);
router.use(roadmapRouter);
router.use(interviewRouter);

export default router;
