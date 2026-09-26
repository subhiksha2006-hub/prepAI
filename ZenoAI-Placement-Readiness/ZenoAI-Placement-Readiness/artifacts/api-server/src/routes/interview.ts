import { Router } from 'express';
import { store, type InterviewEvaluation } from '../data/store';

const router = Router();

router.get('/interview/questions', (_req, res) => {
  res.json({
    questions: store.questions,
    total: store.questions.length,
  });
});

router.post('/interview/evaluate', (req, res) => {
  const { questionId, answer } = req.body;
  if (!answer || typeof answer !== 'string' || answer.trim().length === 0) {
    return res.status(400).json({ error: 'Answer is required for evaluation' });
  }

  const qId = Number(questionId) || 1;
  const question = store.questions.find((q) => q.id === qId) || store.questions[0];

  const wordCount = answer.trim().split(/\s+/).length;
  const lowerAnswer = answer.toLowerCase();

  // Evaluate based on length, keywords, STAR method indicators, and depth
  const matchedKeywords = question.suggestedKeywords.filter((kw) =>
    lowerAnswer.includes(kw.toLowerCase())
  );

  let technicalScore = Math.min(95, Math.max(45, 50 + matchedKeywords.length * 9));
  let structureScore = 55;
  if (wordCount > 30) structureScore += 15;
  if (wordCount > 60) structureScore += 15;
  if (lowerAnswer.includes('result') || lowerAnswer.includes('improved') || lowerAnswer.includes('reduced') || lowerAnswer.includes('%')) {
    structureScore += 10;
  }
  structureScore = Math.min(96, structureScore);

  let problemSolvingScore = Math.min(94, Math.max(50, 60 + matchedKeywords.length * 6));

  const totalScore = Math.round((technicalScore * 0.4) + (structureScore * 0.35) + (problemSolvingScore * 0.25));

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (matchedKeywords.length > 0) {
    strengths.push(`Good utilization of core domain concepts: ${matchedKeywords.slice(0, 3).join(', ')}.`);
  } else {
    improvements.push('Incorporate more specific technical terminology and algorithmic rationale.');
  }

  if (wordCount >= 40) {
    strengths.push('Comprehensive context provided with clear action breakdown.');
  } else {
    improvements.push('Expand upon the specific implementation details and measurable metrics.');
  }

  if (lowerAnswer.includes('%') || /\d+/.test(lowerAnswer)) {
    strengths.push('Strong quantitative evidence and measurable impact demonstrated.');
  } else {
    improvements.push('Include measurable quantitative improvements (e.g. latency reduced by X%, throughput increased).');
  }

  const evaluation: InterviewEvaluation = {
    id: `eval_${Date.now()}`,
    questionId: question.id,
    questionText: question.question,
    answerText: answer,
    score: totalScore,
    feedback: {
      strengths,
      improvements,
      rubricScores: {
        technicalAccuracy: technicalScore,
        structureAndClarity: structureScore,
        problemSolving: problemSolvingScore,
      },
    },
    createdAt: new Date().toISOString(),
  };

  store.evaluations.push(evaluation);

  // Boost communication & interview category scores in store
  const commCat = store.categories.find((c) => c.name === 'Communication');
  if (commCat) commCat.score = Math.min(96, commCat.score + 3);

  const interviewCat = store.categories.find((c) => c.name === 'Interview');
  if (interviewCat) interviewCat.score = Math.min(92, interviewCat.score + 6);

  store.recalculateReadiness();

  res.json({
    success: true,
    evaluation,
    overallReadiness: store.profile.overallReadiness,
    updatedCategories: store.categories,
  });
});

router.get('/interview/evaluations', (_req, res) => {
  res.json({
    evaluations: store.evaluations,
    count: store.evaluations.length,
  });
});

export default router;
