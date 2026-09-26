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

export interface SkillCategory {
  name: string;
  score: number;
  status: 'strong' | 'moderate' | 'critical_gap';
  skills: { name: string; score: number; status: 'matched' | 'gap' }[];
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

export interface RoadmapTask {
  id: number;
  title: string;
  category: 'Coding' | 'Technical' | 'Aptitude' | 'Communication';
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

class Store {
  profile: StudentProfile = {
    id: 'student_1',
    name: 'Arjun Shah',
    avatarInitials: 'AS',
    department: 'Computer Science',
    gradYear: 2026,
    overallReadiness: 68,
    weeklyDelta: 4,
    percentileRank: 18,
    targetCompanyIndex: 0,
  };

  targets: TargetCompany[] = [
    {
      id: 'target_rz',
      company: 'Razorpay',
      role: 'Software Engineer · New Grad',
      short: 'RZ',
      score: 68,
      matchedCount: 2,
      totalSkills: 4,
      skills: [
        { name: 'Data structures', status: 'matched' },
        { name: 'REST API design', status: 'gap', delta: '18 pts' },
        { name: 'Problem solving', status: 'matched' },
        { name: 'System design basics', status: 'gap', delta: '24 pts' },
      ],
    },
    {
      id: 'target_ms',
      company: 'Microsoft',
      role: 'Software Engineer · New Grad',
      short: 'MS',
      score: 61,
      matchedCount: 2,
      totalSkills: 4,
      skills: [
        { name: 'Algorithms & Complexity', status: 'matched' },
        { name: 'Concurrency & OS Concepts', status: 'gap', delta: '14 pts' },
        { name: 'Object Oriented Design', status: 'matched' },
        { name: 'Cloud Basics (Azure)', status: 'gap', delta: '20 pts' },
      ],
    },
    {
      id: 'target_at',
      company: 'Atlassian',
      role: 'Backend Engineer · New Grad',
      short: 'AT',
      score: 64,
      matchedCount: 2,
      totalSkills: 4,
      skills: [
        { name: 'Java / Node.js backend', status: 'matched' },
        { name: 'Distributed Systems', status: 'gap', delta: '22 pts' },
        { name: 'Database Query Optimization', status: 'matched' },
        { name: 'Microservice Patterns', status: 'gap', delta: '16 pts' },
      ],
    },
    {
      id: 'target_goog',
      company: 'Google',
      role: 'Associate Software Engineer',
      short: 'GO',
      score: 59,
      matchedCount: 1,
      totalSkills: 4,
      skills: [
        { name: 'Advanced Graph Algorithms', status: 'gap', delta: '25 pts' },
        { name: 'Dynamic Programming', status: 'gap', delta: '19 pts' },
        { name: 'Clean Code & Testing', status: 'matched' },
        { name: 'Scalability Fundamentals', status: 'gap', delta: '22 pts' },
      ],
    },
  ];

  categories: SkillCategory[] = [
    {
      name: 'Coding',
      score: 72,
      status: 'strong',
      skills: [
        { name: 'Arrays & Two Pointers', score: 85, status: 'matched' },
        { name: 'Sliding Window', score: 58, status: 'gap' },
        { name: 'Trees & Graphs', score: 70, status: 'matched' },
      ],
    },
    {
      name: 'Technical',
      score: 64,
      status: 'moderate',
      skills: [
        { name: 'REST API Design', score: 55, status: 'gap' },
        { name: 'Database Normalization', score: 74, status: 'matched' },
        { name: 'Operating Systems', score: 62, status: 'moderate' as any },
      ],
    },
    {
      name: 'Aptitude',
      score: 58,
      status: 'critical_gap',
      skills: [
        { name: 'Quantitative Analysis', score: 60, status: 'gap' },
        { name: 'Data Interpretation', score: 54, status: 'gap' },
        { name: 'Logical Reasoning', score: 75, status: 'matched' },
      ],
    },
    {
      name: 'Communication',
      score: 78,
      status: 'strong',
      skills: [
        { name: 'STAR Framework', score: 80, status: 'matched' },
        { name: 'Clarity & Articulation', score: 76, status: 'matched' },
      ],
    },
    {
      name: 'Interview',
      score: 49,
      status: 'critical_gap',
      skills: [
        { name: 'Behavioral Answers', score: 68, status: 'matched' },
        { name: 'Live Coding Explanation', score: 45, status: 'gap' },
        { name: 'System Design Walkthrough', score: 34, status: 'gap' },
      ],
    },
  ];

  tasks: RoadmapTask[] = [
    {
      id: 1,
      title: 'Solve: sliding window patterns',
      category: 'Coding',
      meta: 'Coding · priority 01',
      time: '45 min',
      priority: 'Priority 01',
      done: false,
      rationale: 'Unlocks higher coding confidence for Razorpay & Microsoft test rounds.',
    },
    {
      id: 2,
      title: 'REST API design fundamentals',
      category: 'Technical',
      meta: 'Technical · priority 02',
      time: '30 min',
      priority: 'Priority 02',
      done: false,
      rationale: 'Addresses a key 18pt skill gap for backend engineering roles.',
    },
    {
      id: 3,
      title: 'Tell me about your last project',
      category: 'Communication',
      meta: 'Communication · priority 03',
      time: '15 min',
      priority: 'Priority 03',
      done: true,
      rationale: 'Practicing behavioral narrative structure with the STAR method.',
    },
    {
      id: 4,
      title: 'Timed aptitude: data interpretation',
      category: 'Aptitude',
      meta: 'Aptitude · priority 04',
      time: '20 min',
      priority: 'Priority 04',
      done: false,
      rationale: 'Boosts preliminary assessment test clearance probability.',
    },
  ];

  questions: InterviewQuestion[] = [
    {
      id: 1,
      title: 'Performance & Architecture',
      type: 'behavioral + technical',
      question:
        'Tell me about a time you improved the performance of a system or application. What did you measure, and what changed?',
      hints: [
        'Mention baseline metrics (latency, memory, or throughput)',
        'Explain the root cause identified with profiling tools',
        'Describe the architectural or algorithmic optimization applied',
        'Conclude with the quantifiable percentage improvement',
      ],
      suggestedKeywords: ['latency', 'profiling', 'caching', 'indexing', 'throughput', 'bottleneck', 'optimization'],
    },
    {
      id: 2,
      title: 'Scalability & API Design',
      type: 'technical system design',
      question:
        'How would you design a rate limiter for a high-traffic payment API like Razorpay? What data store and algorithm would you choose?',
      hints: [
        'Compare Token Bucket vs Leaky Bucket vs Sliding Window Counter',
        'Consider Redis for in-memory atomicity and TTLs',
        'Address distributed race conditions with Lua scripts',
      ],
      suggestedKeywords: ['token bucket', 'redis', 'sliding window', 'rate limit', '429 too many requests', 'concurrency'],
    },
    {
      id: 3,
      title: 'Conflict & Team Collaboration',
      type: 'behavioral STAR',
      question:
        'Describe a situation where you had a disagreement with a team member on a technical decision. How did you resolve it?',
      hints: [
        'State the Situation and Task objectively without blaming',
        'Detail the Action: data-driven benchmarks or architectural trade-offs',
        'Show the constructive Result and impact on team trust',
      ],
      suggestedKeywords: ['situation', 'benchmarking', 'trade-offs', 'alignment', 'collaboration', 'outcome'],
    },
  ];

  evaluations: InterviewEvaluation[] = [];

  recalculateReadiness() {
    const completedCount = this.tasks.filter((t) => t.done).length;
    const taskBonus = (completedCount - 1) * 2;
    const interviewBonus = this.evaluations.length > 0 ? Math.min(6, this.evaluations.length * 3) : 0;
    
    // Base 68 + task completion delta + interview completions
    this.profile.overallReadiness = Math.min(98, Math.max(50, 68 + taskBonus + interviewBonus));
  }
}

export const store = new Store();
