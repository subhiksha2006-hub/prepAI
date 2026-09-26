import { type ReactElement, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  ArrowUpRight, 
  BarChart3, 
  Bell, 
  BrainCircuit, 
  Check, 
  ChevronDown, 
  ChevronRight, 
  CircleDot, 
  Clock3, 
  LayoutDashboard, 
  Map, 
  MessageSquare, 
  Mic2, 
  Play, 
  Plus, 
  RefreshCw, 
  Settings, 
  ShieldCheck, 
  SlidersHorizontal, 
  Sparkles, 
  Star, 
  Target, 
  X, 
  Zap 
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { api, type RoadmapTask, type TargetCompany, type SkillCategory, type InterviewQuestion, type InterviewEvaluation } from '@/lib/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
    },
  },
});

type View = 'overview' | 'gaps' | 'roadmap' | 'interview';

function AppShell() {
  const qc = useQueryClient();
  const [activeView, setActiveView] = useState<View>('overview');
  const [toast, setToast] = useState('');
  const [mockActive, setMockActive] = useState(false);
  const [interviewAnswer, setInterviewAnswer] = useState('');
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [latestEvaluation, setLatestEvaluation] = useState<InterviewEvaluation | null>(null);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);

  const overviewRef = useRef<HTMLElement>(null);
  const gapsRef = useRef<HTMLElement>(null);
  const roadmapRef = useRef<HTMLElement>(null);
  const interviewRef = useRef<HTMLElement>(null);

  // Queries connected to Express Backend
  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: api.getProfile,
  });

  const { data: targetsData } = useQuery({
    queryKey: ['targets'],
    queryFn: api.getTargets,
  });

  const { data: skillsData } = useQuery({
    queryKey: ['skills'],
    queryFn: api.getSkills,
  });

  const { data: roadmapData } = useQuery({
    queryKey: ['roadmap'],
    queryFn: api.getRoadmap,
  });

  const { data: questionsData } = useQuery({
    queryKey: ['questions'],
    queryFn: api.getInterviewQuestions,
  });

  // Mutations
  const toggleTaskMutation = useMutation({
    mutationFn: (taskId: number) => api.toggleTask(taskId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['roadmap'] });
      qc.invalidateQueries({ queryKey: ['profile'] });
      qc.invalidateQueries({ queryKey: ['skills'] });
      showToast(`Roadmap updated — readiness calibrated to ${data.overallReadiness}%.`);
    },
  });

  const changeTargetMutation = useMutation({
    mutationFn: (targetIndex: number) => api.setTarget(targetIndex),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['profile'] });
      qc.invalidateQueries({ queryKey: ['targets'] });
      showToast(`Target role calibrated to ${data.target.company}.`);
    },
  });

  const addTaskMutation = useMutation({
    mutationFn: (title: string) => api.addTask({
      title,
      category: 'Coding',
      priority: 'Priority 05',
      time: '30 min',
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roadmap'] });
      setNewTaskTitle('');
      setShowAddTask(false);
      showToast('New milestone added to your adaptive roadmap.');
    },
  });

  const evaluateMutation = useMutation({
    mutationFn: ({ qId, ans }: { qId: number; ans: string }) => api.evaluateInterview(qId, ans),
    onSuccess: (data) => {
      setLatestEvaluation(data.evaluation);
      qc.invalidateQueries({ queryKey: ['profile'] });
      qc.invalidateQueries({ queryKey: ['skills'] });
      setIsSubmittingAnswer(false);
      showToast(`Interview evaluated! Score: ${data.evaluation.score}/100. Signal updated.`);
    },
    onError: () => {
      setIsSubmittingAnswer(false);
      showToast('Error evaluating response. Please try again.');
    },
  });

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3200);
  };

  const navigateView = (view: View) => {
    setActiveView(view);
    const targetRef = { overview: overviewRef, gaps: gapsRef, roadmap: roadmapRef, interview: interviewRef }[view];
    targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const currentProfile = profileData?.profile || {
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

  const targets = targetsData?.targets || [
    { id: '1', company: 'Razorpay', role: 'Software Engineer · New Grad', short: 'RZ', score: 68, matchedCount: 2, totalSkills: 4, skills: [] },
    { id: '2', company: 'Microsoft', role: 'Software Engineer · New Grad', short: 'MS', score: 61, matchedCount: 2, totalSkills: 4, skills: [] },
    { id: '3', company: 'Atlassian', role: 'Backend Engineer · New Grad', short: 'AT', score: 64, matchedCount: 2, totalSkills: 4, skills: [] },
  ];

  const currentTarget = targets[currentProfile.targetCompanyIndex] || targets[0];
  const categoryData = skillsData?.categories || [
    { name: 'Coding', score: 72, status: 'strong', skills: [] },
    { name: 'Technical', score: 64, status: 'moderate', skills: [] },
    { name: 'Aptitude', score: 58, status: 'critical_gap', skills: [] },
    { name: 'Communication', score: 78, status: 'strong', skills: [] },
    { name: 'Interview', score: 49, status: 'critical_gap', skills: [] },
  ];

  const tasks = roadmapData?.tasks || [];
  const completedTasks = tasks.filter((t) => t.done).length;
  const questions = questionsData?.questions || [
    {
      id: 1,
      title: 'Performance & Architecture',
      type: 'behavioral + technical',
      question: 'Tell me about a time you improved the performance of a system. What did you measure, and what changed?',
      hints: ['Mention baseline latency/throughput metrics', 'Explain optimization approach', 'Conclude with % improvement'],
      suggestedKeywords: ['latency', 'throughput', 'caching'],
    },
  ];

  const currentQuestion = questions[selectedQuestionIndex] || questions[0];

  const handleStartMock = () => {
    setMockActive(true);
    setLatestEvaluation(null);
    setInterviewAnswer('');
    navigateView('interview');
  };

  const handleSubmitInterview = () => {
    if (!interviewAnswer.trim()) {
      showToast('Please type your interview response before submitting.');
      return;
    }
    setIsSubmittingAnswer(true);
    evaluateMutation.mutate({ qId: currentQuestion.id, ans: interviewAnswer });
  };

  return (
    <div className="zeno-app">
      <div className="shell">
        <aside className="sidebar" aria-label="Primary navigation">
          <div className="brand">
            <div className="brand-logo-container">
              <img src="/prep-ai-logo.jpg" alt="prep AI logo" className="brand-logo-img" />
            </div>
            <div className="brand-name">prep<span>AI</span></div>
          </div>
          <div className="nav-label eyebrow">Workspace</div>
          <nav className="nav">
            <NavButton icon={<LayoutDashboard size={16} />} label="Overview" active={activeView === 'overview'} onClick={() => navigateView('overview')} />
            <NavButton icon={<BarChart3 size={16} />} label="Skill gaps" active={activeView === 'gaps'} onClick={() => navigateView('gaps')} />
            <NavButton icon={<Map size={16} />} label="My roadmap" active={activeView === 'roadmap'} onClick={() => navigateView('roadmap')} />
            <NavButton icon={<MessageSquare size={16} />} label="Mock interview" active={activeView === 'interview'} onClick={() => navigateView('interview')} />
          </nav>
          
          <div className="side-spacer" />
          
          {/* Backend Connection Indicator Badge */}
          <div style={{ padding: '0 12px 14px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#a295ba' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#45f59c', boxShadow: '0 0 8px #45f59c', display: 'inline-block' }} />
            <span>API Engine: <strong>Live</strong></span>
          </div>

          <button className="nav-button" type="button" data-testid="button-settings" onClick={() => showToast('Backend profile sync active.')}>
            <Settings size={16} /><span>Settings</span>
          </button>
          <div className="profile-mini">
            <div className="avatar">{currentProfile.avatarInitials}</div>
            <div><strong>{currentProfile.name}</strong><small>{currentProfile.department} · {currentProfile.gradYear}</small></div>
          </div>
        </aside>

        <main className="main">
          <header className="topbar">
            <div className="breadcrumb">
              <span>Workspace</span>
              <ChevronRight size={13} style={{ verticalAlign: 'middle', margin: '0 5px' }} />
              <strong>{activeView === 'overview' ? 'Readiness overview' : activeView === 'gaps' ? 'Skill gap analysis' : activeView === 'roadmap' ? 'Personal roadmap' : 'AI mock interview'}</strong>
            </div>
            <div className="top-actions">
              <button className="icon-button" type="button" aria-label="Refresh signals" data-testid="button-refresh" onClick={() => { qc.invalidateQueries(); showToast('Recalibrating placement signals from backend…'); }}>
                <RefreshCw size={14} />
              </button>
              <button className="icon-button" type="button" aria-label="View notifications" data-testid="button-notifications" onClick={() => showToast('You are on track for upcoming placement drives.')}>
                <Bell size={15} />
              </button>
              <div className="avatar top-avatar" aria-label={`${currentProfile.name} profile`}>{currentProfile.avatarInitials}</div>
            </div>
          </header>

          <div className="content">
            <section className="welcome-row" ref={overviewRef} aria-labelledby="welcome-title">
              <div>
                <div className="eyebrow">Monday · Placement Readiness Suite</div>
                <h1 id="welcome-title">Good morning, {currentProfile.name.split(' ')[0]}.</h1>
                <p className="subhead">Backend model synchronized. Target signal is calibrated in real-time.</p>
              </div>
              <div className="target-control">
                <label className="field-label" htmlFor="target-company">Target placement</label>
                <div className="select-wrap">
                  <select 
                    id="target-company" 
                    value={currentProfile.targetCompanyIndex} 
                    data-testid="select-target-company" 
                    onChange={(event) => changeTargetMutation.mutate(Number(event.target.value))}
                  >
                    {targets.map((item, index) => (
                      <option value={index} key={item.company}>{item.company} · {item.role.split(' · ')[0]}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} />
                </div>
              </div>
            </section>

            <div className="grid top-grid">
              {/* Overall Readiness Panel */}
              <section className="panel panel-pad score-panel" aria-labelledby="readiness-title">
                <div className="panel-heading">
                  <div>
                    <div className="panel-kicker">Placement readiness</div>
                    <h2 className="panel-title" id="readiness-title">Your current signal</h2>
                  </div>
                  <ShieldCheck size={17} color="#d879ef" />
                </div>
                <svg className="constellation" width="105" height="90" viewBox="0 0 105 90" aria-hidden="true">
                  <line x1="8" y1="59" x2="46" y2="25" /><line x1="46" y1="25" x2="86" y2="42" /><line x1="46" y1="25" x2="61" y2="75" /><line x1="61" y1="75" x2="86" y2="42" />
                  <circle cx="8" cy="59" r="2" /><circle cx="46" cy="25" r="3" /><circle cx="86" cy="42" r="2" /><circle cx="61" cy="75" r="2" />
                </svg>
                <div className="score-display">
                  <span className="score-number">{currentProfile.overallReadiness}</span>
                  <span className="score-percent">%</span>
                </div>
                <div className="score-caption">Top {currentProfile.percentileRank}% of candidates targeting {currentTarget.company}</div>
                <div className="score-track" aria-label={`${currentProfile.overallReadiness}% overall readiness`}>
                  <span style={{ width: `${currentProfile.overallReadiness}%` }} />
                </div>
                <div className="delta">
                  <ArrowUpRight size={12} style={{ verticalAlign: 'middle' }} /> +{currentProfile.weeklyDelta} pts this week
                </div>
              </section>

              {/* Skills Signal Panel */}
              <section className="panel panel-pad" ref={gapsRef} aria-labelledby="skills-title">
                <div className="panel-heading">
                  <div>
                    <div className="panel-kicker">Evidence-weighted profile</div>
                    <h2 className="panel-title" id="skills-title">Skill breakdown</h2>
                  </div>
                  <SlidersHorizontal size={16} color="#9f86b4" />
                </div>
                <div className="categories">
                  {categoryData.map((category) => (
                    <div className="category-row" key={category.name} data-testid={`status-skill-${category.name.toLowerCase()}`}>
                      <span className="category-name">{category.name}</span>
                      <div className="thin-track">
                        <span style={{ 
                          width: `${category.score}%`, 
                          background: category.score >= 70 ? 'linear-gradient(90deg, #b548ed, #e9a1ff)' : category.score >= 55 ? '#a875db' : '#ea6b8e' 
                        }} />
                      </div>
                      <span className="category-score">{category.score}</span>
                    </div>
                  ))}
                </div>
                <button className="secondary-button" type="button" data-testid="button-view-gaps" onClick={() => navigateView('gaps')} style={{ marginTop: 20 }}>
                  View gap analysis <ArrowUpRight size={13} />
                </button>
              </section>

              {/* AI Priority Cue Panel */}
              <section className="panel panel-pad next-panel" aria-labelledby="next-title">
                <div className="panel-heading">
                  <div className="panel-kicker">AI priority cue</div>
                  <span className="priority-chip">Priority 01</span>
                </div>
                <h2 className="next-title" id="next-title">Close the {categoryData.find(c => c.score < 60)?.name || 'Coding'} gap first.</h2>
                <p className="next-copy">
                  Targeted analysis for <strong>{currentTarget.company}</strong> indicates mastering core data structure patterns and answering live system questions yields highest interview clearance.
                </p>
                <button className="primary-button" type="button" data-testid="button-next-action" onClick={() => navigateView('roadmap')}>
                  Open next action <ArrowUpRight size={14} />
                </button>
              </section>
            </div>

            <div className="grid lower-grid">
              {/* Adaptive Roadmap Panel */}
              <section className="panel panel-pad roadmap-panel" ref={roadmapRef} aria-labelledby="roadmap-title">
                <div className="panel-heading">
                  <div>
                    <div className="panel-kicker">Adaptive plan · live sync</div>
                    <h2 className="panel-title" id="roadmap-title">Your roadmap</h2>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="panel-kicker">{completedTasks}/{tasks.length} complete</span>
                    <button 
                      className="icon-button" 
                      style={{ width: 26, height: 26 }} 
                      type="button" 
                      title="Add roadmap task" 
                      onClick={() => setShowAddTask(!showAddTask)}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>

                {showAddTask && (
                  <div style={{ marginBottom: 14, padding: 12, borderRadius: 8, background: 'rgba(28, 18, 48, 0.75)', border: '1px solid rgba(220, 140, 255, 0.2)' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input 
                        type="text" 
                        placeholder="e.g. Master Trie prefix trees & graph BFS…" 
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        style={{ flex: 1, background: '#120e1f', border: '1px solid rgba(200, 150, 255, 0.3)', borderRadius: 6, color: '#f3e8fc', padding: '6px 10px', fontSize: 12 }}
                      />
                      <button 
                        className="primary-button" 
                        style={{ padding: '6px 12px', fontSize: 12 }}
                        type="button" 
                        onClick={() => { if (newTaskTitle.trim()) addTaskMutation.mutate(newTaskTitle); }}
                      >
                        Add Task
                      </button>
                    </div>
                  </div>
                )}

                <div className="roadmap-list">
                  {tasks.map((task: RoadmapTask) => (
                    <div className={`task ${task.done ? 'done' : ''}`} key={task.id}>
                      <button 
                        className={`task-check ${task.done ? 'done' : ''}`} 
                        type="button" 
                        aria-label={task.done ? `Mark ${task.title} incomplete` : `Mark ${task.title} complete`} 
                        data-testid={`button-task-${task.id}`} 
                        onClick={() => toggleTaskMutation.mutate(task.id)}
                      >
                        {task.done && <Check size={13} strokeWidth={3} />}
                      </button>
                      <div style={{ flex: 1 }}>
                        <p className="task-title">{task.title}</p>
                        <div className="task-meta">{task.meta} {task.rationale && <span style={{ opacity: 0.7 }}>· {task.rationale}</span>}</div>
                      </div>
                      <span className="task-time">
                        <Clock3 size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />{task.time}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="roadmap-footer">
                  <span className="progress-copy">
                    Daily focus <strong>{tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%</strong>
                  </span>
                  <button className="secondary-button" type="button" data-testid="button-roadmap-details" onClick={() => showToast('Roadmap recalculates automatically on every task change.')}>
                    See plan logic <ChevronRight size={13} />
                  </button>
                </div>
              </section>

              {/* Target Role Readiness & Skill Gaps Panel */}
              <section className="panel panel-pad role-panel" aria-labelledby="role-title">
                <div className="panel-heading">
                  <div>
                    <div className="panel-kicker">Target company match</div>
                    <h2 className="panel-title" id="role-title">Role fit</h2>
                  </div>
                  <Target size={16} color="#c77be0" />
                </div>
                <div className="role-company">
                  <div className="company-orb">{currentTarget.short}</div>
                  <div>
                    <strong>{currentTarget.company}</strong>
                    <span>{currentTarget.role}</span>
                  </div>
                </div>
                <div className="role-score">
                  <div>
                    <strong>{currentTarget.score + (completedTasks > 1 ? 2 : 0)}%</strong>
                    <small> role readiness match</small>
                  </div>
                  <span className="up"><ArrowUpRight size={12} /> on track</span>
                </div>
                <div className="skill-list">
                  {currentTarget.skills?.map((skill, index) => (
                    <div className="skill-line" key={index}>
                      <span>{skill.name}</span>
                      {skill.status === 'matched' ? (
                        <span className="match"><Check size={12} /> matched</span>
                      ) : (
                        <span className="gap">gap {skill.delta ? `· ${skill.delta}` : ''}</span>
                      )}
                    </div>
                  ))}
                  {(!currentTarget.skills || currentTarget.skills.length === 0) && (
                    <>
                      <div className="skill-line"><span>Data structures</span><span className="match"><Check size={12} /> matched</span></div>
                      <div className="skill-line"><span>REST API design</span><span className="gap">gap · 18 pts</span></div>
                      <div className="skill-line"><span>Problem solving</span><span className="match"><Check size={12} /> matched</span></div>
                      <div className="skill-line"><span>System design basics</span><span className="gap">gap · 24 pts</span></div>
                    </>
                  )}
                </div>
              </section>
            </div>

            {/* AI Mock Interview Section */}
            <section className="panel panel-pad mock-panel" ref={interviewRef} aria-labelledby="mock-title">
              <div className="mock-copy">
                <div className="mic-orb">{mockActive ? <CircleDot size={20} /> : <Mic2 size={20} />}</div>
                <div>
                  <h2 id="mock-title">{mockActive ? 'AI Interview Engine Active' : 'Pressure-test your signal.'}</h2>
                  <p>{mockActive ? `Question tailored for ${currentTarget.company} role evaluation. Submit your answer for instant rubric grading.` : `A 12-minute AI mock interview tuned to your gaps and target role at ${currentTarget.company}.`}</p>
                </div>
              </div>
              {!mockActive ? (
                <button className="primary-button" type="button" data-testid="button-start-interview" onClick={handleStartMock}>
                  <Play size={14} fill="currentColor" /> Start AI mock interview
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button 
                    className="primary-button" 
                    type="button" 
                    disabled={isSubmittingAnswer}
                    data-testid="button-submit-interview" 
                    onClick={handleSubmitInterview}
                  >
                    <Zap size={14} /> {isSubmittingAnswer ? 'Evaluating with AI…' : 'Submit for AI Evaluation'}
                  </button>
                  <button 
                    className="secondary-button" 
                    type="button" 
                    data-testid="button-close-interview" 
                    onClick={() => setMockActive(false)}
                  >
                    <X size={14} /> Exit
                  </button>
                </div>
              )}
            </section>

            {mockActive && (
              <section className="panel panel-pad interview-question" aria-label="Mock interview question" style={{ marginTop: 17, background: 'rgba(24,18,39,.95)', border: '1px solid rgba(220,150,255,0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div className="panel-kicker">Question 0{currentQuestion.id} · {currentQuestion.type}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {questions.map((q, idx) => (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setSelectedQuestionIndex(idx)}
                        style={{
                          background: selectedQuestionIndex === idx ? '#b548ed' : 'rgba(255,255,255,0.06)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 4,
                          padding: '3px 8px',
                          fontSize: 11,
                        }}
                      >
                        Q{idx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                <h2 style={{ fontSize: 18, letterSpacing: '-.02em', maxWidth: 740, lineHeight: 1.4, margin: '10px 0 14px', color: '#fbf7ff' }}>
                  {currentQuestion.question}
                </h2>

                {currentQuestion.hints && (
                  <div style={{ marginBottom: 14, padding: '8px 12px', background: 'rgba(180,72,237,0.1)', borderRadius: 6, borderLeft: '3px solid #d879ef' }}>
                    <div style={{ fontSize: 11, color: '#e8cbfb', fontWeight: 600, marginBottom: 3 }}>💡 Answer Guidance:</div>
                    <div style={{ fontSize: 11, color: '#d0bede' }}>{currentQuestion.hints.join(' • ')}</div>
                  </div>
                )}

                <textarea 
                  aria-label="Your interview answer" 
                  data-testid="input-interview-answer" 
                  value={interviewAnswer}
                  onChange={(e) => setInterviewAnswer(e.target.value)}
                  placeholder="Structure your answer using Situation, Task, Action, and quantifiable Result (e.g. improved Redis caching throughput by 42%)…" 
                  style={{ width: '100%', minHeight: 120, resize: 'vertical', border: '1px solid rgba(216,155,250,.25)', background: '#120e1e', borderRadius: 8, color: '#eee5f6', padding: 13, fontSize: 13, lineHeight: 1.5 }} 
                />

                {latestEvaluation && (
                  <div style={{ marginTop: 20, padding: 18, background: 'rgba(18, 12, 32, 0.95)', border: '1px solid rgba(181, 72, 237, 0.45)', borderRadius: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Star size={18} color="#ffd24d" fill="#ffd24d" />
                        <h3 style={{ margin: 0, fontSize: 16, color: '#fff' }}>AI Evaluation Report</h3>
                      </div>
                      <div style={{ background: 'linear-gradient(135deg, #b548ed, #ea96ff)', padding: '4px 12px', borderRadius: 20, color: '#15092b', fontWeight: 700, fontSize: 14 }}>
                        {latestEvaluation.score} / 100
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 14 }}>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 6 }}>
                        <div style={{ fontSize: 10, textTransform: 'uppercase', color: '#9b8eac' }}>Technical Accuracy</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#b9fbc0' }}>{latestEvaluation.feedback.rubricScores.technicalAccuracy}%</div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 6 }}>
                        <div style={{ fontSize: 10, textTransform: 'uppercase', color: '#9b8eac' }}>STAR Structure & Clarity</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#90e0ef' }}>{latestEvaluation.feedback.rubricScores.structureAndClarity}%</div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 6 }}>
                        <div style={{ fontSize: 10, textTransform: 'uppercase', color: '#9b8eac' }}>Problem Solving</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#f3c4fb' }}>{latestEvaluation.feedback.rubricScores.problemSolving}%</div>
                      </div>
                    </div>

                    <div style={{ marginBottom: 10 }}>
                      <strong style={{ color: '#b9fbc0', fontSize: 12, display: 'block', marginBottom: 4 }}>✓ Strengths Identified:</strong>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#e0d5ec' }}>
                        {latestEvaluation.feedback.strengths.map((s, idx) => <li key={idx}>{s}</li>)}
                      </ul>
                    </div>

                    <div>
                      <strong style={{ color: '#ffb3c1', fontSize: 12, display: 'block', marginBottom: 4 }}>⚡ Recommended Improvements:</strong>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#e0d5ec' }}>
                        {latestEvaluation.feedback.improvements.map((imp, idx) => <li key={idx}>{imp}</li>)}
                      </ul>
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>
        </main>
      </div>
      {toast && (
        <div className="toast-note" role="status" data-testid="status-toast">
          <Sparkles size={14} style={{ verticalAlign: 'middle', marginRight: 7, color: '#ea96ff' }} />
          {toast}
        </div>
      )}
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: { icon: ReactElement; label: string; active: boolean; onClick: () => void }) {
  return (
    <button 
      className={`nav-button ${active ? 'active' : ''}`} 
      type="button" 
      data-testid={`button-nav-${label.toLowerCase().replaceAll(' ', '-')}`} 
      onClick={onClick} 
      aria-current={active ? 'page' : undefined}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={AppShell} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <ErrorBoundary>
            <Router />
          </ErrorBoundary>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;