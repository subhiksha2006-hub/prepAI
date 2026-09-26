export interface StudentProfile {
  id: string;
  name: string;
  avatarInitials: string;
  department: string;
  gradYear: number;
  overallReadiness: number;
  weeklyDelta: number;
  percentileRank: number;
  targetCompanyIndex: number;
}

export interface TargetCompany {
  id: string;
  company: string;
  role: string;
  short: string;
  score: number;
  matchedCount: number;
  totalSkills: number;
  skills: { name: string; status: 'matched' | 'gap'; delta?: string }[];
}

export interface SkillCategory {
  name: string;
  score: number;
  status: 'strong' | 'moderate' | 'critical_gap';
  skills: { name: string; score: number; status: 'matched' | 'gap' }[];
}

export interface RoadmapTask {
  id: number;
  title: string;
  category: string;
  meta: string;
  time: string;
  priority: string;
  done: boolean;
  rationale: string;
}

export interface InterviewQuestion {
  id: number;
  title: string;
  type: string;
  question: string;
  hints: string[];
  suggestedKeywords: string[];
}

export interface InterviewEvaluation {
  id: string;
  questionId: number;
  questionText: string;
  answerText: string;
  score: number;
  feedback: {
    strengths: string[];
    improvements: string[];
    rubricScores: {
      technicalAccuracy: number;
      structureAndClarity: number;
      problemSolving: number;
    };
  };
  createdAt: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`API Error [${res.status}]: ${errorBody}`);
  }
  return res.json();
}

export const api = {
  async getProfile(): Promise<{ profile: StudentProfile; target: TargetCompany; summary: any }> {
    const res = await fetch('/api/profile');
    return handleResponse(res);
  },

  async setTarget(targetIndex: number): Promise<{ success: boolean; profile: StudentProfile; target: TargetCompany }> {
    const res = await fetch('/api/profile/target', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetIndex }),
    });
    return handleResponse(res);
  },

  async getTargets(): Promise<{ targets: TargetCompany[]; selectedTargetIndex: number }> {
    const res = await fetch('/api/targets');
    return handleResponse(res);
  },

  async getSkills(): Promise<{ categories: SkillCategory[]; criticalGaps: any[] }> {
    const res = await fetch('/api/skills');
    return handleResponse(res);
  },

  async getRoadmap(): Promise<{ tasks: RoadmapTask[]; completedCount: number; totalCount: number; completionPercentage: number }> {
    const res = await fetch('/api/roadmap');
    return handleResponse(res);
  },

  async toggleTask(id: number): Promise<{ success: boolean; task: RoadmapTask; tasks: RoadmapTask[]; overallReadiness: number }> {
    const res = await fetch(`/api/roadmap/task/${id}/toggle`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  async addTask(task: { title: string; category: string; time: string; priority: string }): Promise<{ success: boolean; task: RoadmapTask; tasks: RoadmapTask[] }> {
    const res = await fetch('/api/roadmap/task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    return handleResponse(res);
  },

  async getInterviewQuestions(): Promise<{ questions: InterviewQuestion[]; total: number }> {
    const res = await fetch('/api/interview/questions');
    return handleResponse(res);
  },

  async evaluateInterview(questionId: number, answer: string): Promise<{ success: boolean; evaluation: InterviewEvaluation; overallReadiness: number; updatedCategories: SkillCategory[] }> {
    const res = await fetch('/api/interview/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, answer }),
    });
    return handleResponse(res);
  },

  async getEvaluations(): Promise<{ evaluations: InterviewEvaluation[]; count: number }> {
    const res = await fetch('/api/interview/evaluations');
    return handleResponse(res);
  },
};
