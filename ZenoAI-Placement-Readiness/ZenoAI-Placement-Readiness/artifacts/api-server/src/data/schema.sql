-- ============================================================================
-- Prep AI Supabase Database Schema & Migration Script
-- Target Supabase Instance: https://endbzityjlqpfqkmcvxe.supabase.co
-- Endpoint: /rest/v1/prepAI
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. Main prepAI Universal Table (Direct match for /rest/v1/prepAI)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public."prepAI" (
    id BIGSERIAL PRIMARY KEY,
    record_type VARCHAR(50) NOT NULL, -- 'profile', 'task', 'target', 'skill', 'evaluation'
    name VARCHAR(255),
    title VARCHAR(255),
    category VARCHAR(100),
    score INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for high-performance filtering on /rest/v1/prepAI
CREATE INDEX IF NOT EXISTS idx_prepAI_record_type ON public."prepAI" (record_type);
CREATE INDEX IF NOT EXISTS idx_prepAI_category ON public."prepAI" (category);

-- ----------------------------------------------------------------------------
-- 2. Structured Student Profiles Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prep_profiles (
    id TEXT PRIMARY KEY DEFAULT 'student_1',
    name VARCHAR(255) NOT NULL DEFAULT 'Arjun Shah',
    avatar_initials VARCHAR(10) DEFAULT 'AS',
    department VARCHAR(255) DEFAULT 'Computer Science',
    grad_year INTEGER DEFAULT 2026,
    overall_readiness INTEGER DEFAULT 68,
    weekly_delta INTEGER DEFAULT 4,
    percentile_rank INTEGER DEFAULT 18,
    target_company_id VARCHAR(50) DEFAULT 'target_rz',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 3. Target Placement Companies & Role Requirements Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prep_target_companies (
    id VARCHAR(50) PRIMARY KEY,
    company VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    short_code VARCHAR(10) NOT NULL,
    score INTEGER NOT NULL DEFAULT 60,
    matched_count INTEGER NOT NULL DEFAULT 2,
    total_skills INTEGER NOT NULL DEFAULT 4,
    skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 4. Evidence-Weighted Skill Categories Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prep_skill_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    score INTEGER NOT NULL DEFAULT 50,
    status VARCHAR(50) NOT NULL DEFAULT 'moderate', -- 'strong', 'moderate', 'critical_gap'
    skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 5. Adaptive Roadmap Milestones & Tasks Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prep_roadmap_tasks (
    id BIGSERIAL PRIMARY KEY,
    profile_id TEXT REFERENCES public.prep_profiles(id) ON DELETE CASCADE DEFAULT 'student_1',
    title VARCHAR(500) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Coding',
    meta_label VARCHAR(150),
    time_estimate VARCHAR(50) DEFAULT '30 min',
    priority_label VARCHAR(50) DEFAULT 'Priority 01',
    is_done BOOLEAN DEFAULT FALSE,
    rationale TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_prep_roadmap_profile ON public.prep_roadmap_tasks(profile_id);

-- ----------------------------------------------------------------------------
-- 6. Interview Questions Repository Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prep_interview_questions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    question_type VARCHAR(100) NOT NULL DEFAULT 'behavioral + technical',
    question_text TEXT NOT NULL,
    hints JSONB DEFAULT '[]'::jsonb,
    suggested_keywords JSONB DEFAULT '[]'::jsonb,
    target_company_id VARCHAR(50) REFERENCES public.prep_target_companies(id) ON DELETE SET NULL
);

-- ----------------------------------------------------------------------------
-- 7. AI Mock Interview Evaluations Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prep_interview_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id INTEGER REFERENCES public.prep_interview_questions(id) ON DELETE CASCADE,
    profile_id TEXT REFERENCES public.prep_profiles(id) ON DELETE CASCADE DEFAULT 'student_1',
    question_text TEXT NOT NULL,
    answer_text TEXT NOT NULL,
    overall_score INTEGER NOT NULL,
    technical_accuracy INTEGER NOT NULL,
    structure_and_clarity INTEGER NOT NULL,
    problem_solving INTEGER NOT NULL,
    strengths JSONB DEFAULT '[]'::jsonb,
    improvements JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_prep_eval_profile ON public.prep_interview_evaluations(profile_id);

-- ----------------------------------------------------------------------------
-- 8. Row Level Security (RLS) & Public Access Policies
-- ----------------------------------------------------------------------------
ALTER TABLE public."prepAI" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prep_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prep_target_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prep_skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prep_roadmap_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prep_interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prep_interview_evaluations ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access for anonymous and authenticated clients (Demo configuration)
CREATE POLICY "Allow public all access on prepAI" ON public."prepAI" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on prep_profiles" ON public.prep_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on prep_target_companies" ON public.prep_target_companies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on prep_skill_categories" ON public.prep_skill_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on prep_roadmap_tasks" ON public.prep_roadmap_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on prep_interview_questions" ON public.prep_interview_questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on prep_interview_evaluations" ON public.prep_interview_evaluations FOR ALL USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 9. Initial Seed Data
-- ----------------------------------------------------------------------------

-- Seed Profiles
INSERT INTO public.prep_profiles (id, name, avatar_initials, department, grad_year, overall_readiness, weekly_delta, percentile_rank, target_company_id)
VALUES ('student_1', 'Arjun Shah', 'AS', 'Computer Science', 2026, 68, 4, 18, 'target_rz')
ON CONFLICT (id) DO UPDATE SET overall_readiness = EXCLUDED.overall_readiness;

-- Seed Target Companies
INSERT INTO public.prep_target_companies (id, company, role, short_code, score, matched_count, total_skills, skills)
VALUES 
('target_rz', 'Razorpay', 'Software Engineer · New Grad', 'RZ', 68, 2, 4, '[{"name": "Data structures", "status": "matched"}, {"name": "REST API design", "status": "gap", "delta": "18 pts"}, {"name": "Problem solving", "status": "matched"}, {"name": "System design basics", "status": "gap", "delta": "24 pts"}]'::jsonb),
('target_ms', 'Microsoft', 'Software Engineer · New Grad', 'MS', 61, 2, 4, '[{"name": "Algorithms & Complexity", "status": "matched"}, {"name": "Concurrency & OS Concepts", "status": "gap", "delta": "14 pts"}, {"name": "Object Oriented Design", "status": "matched"}, {"name": "Cloud Basics (Azure)", "status": "gap", "delta": "20 pts"}]'::jsonb),
('target_at', 'Atlassian', 'Backend Engineer · New Grad', 'AT', 64, 2, 4, '[{"name": "Java / Node.js backend", "status": "matched"}, {"name": "Distributed Systems", "status": "gap", "delta": "22 pts"}, {"name": "Database Query Optimization", "status": "matched"}, {"name": "Microservice Patterns", "status": "gap", "delta": "16 pts"}]'::jsonb),
('target_goog', 'Google', 'Associate Software Engineer', 'GO', 59, 1, 4, '[{"name": "Advanced Graph Algorithms", "status": "gap", "delta": "25 pts"}, {"name": "Dynamic Programming", "status": "gap", "delta": "19 pts"}, {"name": "Clean Code & Testing", "status": "matched"}, {"name": "Scalability Fundamentals", "status": "gap", "delta": "22 pts"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Seed Skill Categories
INSERT INTO public.prep_skill_categories (name, score, status, skills)
VALUES 
('Coding', 72, 'strong', '[{"name": "Arrays & Two Pointers", "score": 85, "status": "matched"}, {"name": "Sliding Window", "score": 58, "status": "gap"}, {"name": "Trees & Graphs", "score": 70, "status": "matched"}]'::jsonb),
('Technical', 64, 'moderate', '[{"name": "REST API Design", "score": 55, "status": "gap"}, {"name": "Database Normalization", "score": 74, "status": "matched"}, {"name": "Operating Systems", "score": 62, "status": "moderate"}]'::jsonb),
('Aptitude', 58, 'critical_gap', '[{"name": "Quantitative Analysis", "score": 60, "status": "gap"}, {"name": "Data Interpretation", "score": 54, "status": "gap"}, {"name": "Logical Reasoning", "score": 75, "status": "matched"}]'::jsonb),
('Communication', 78, 'strong', '[{"name": "STAR Framework", "score": 80, "status": "matched"}, {"name": "Clarity & Articulation", "score": 76, "status": "matched"}]'::jsonb),
('Interview', 49, 'critical_gap', '[{"name": "Behavioral Answers", "score": 68, "status": "matched"}, {"name": "Live Coding Explanation", "score": 45, "status": "gap"}, {"name": "System Design Walkthrough", "score": 34, "status": "gap"}]'::jsonb)
ON CONFLICT (name) DO UPDATE SET score = EXCLUDED.score;

-- Seed Roadmap Tasks
INSERT INTO public.prep_roadmap_tasks (profile_id, title, category, meta_label, time_estimate, priority_label, is_done, rationale)
VALUES 
('student_1', 'Solve: sliding window patterns', 'Coding', 'Coding · priority 01', '45 min', 'Priority 01', false, 'Unlocks higher coding confidence for Razorpay & Microsoft test rounds.'),
('student_1', 'REST API design fundamentals', 'Technical', 'Technical · priority 02', '30 min', 'Priority 02', false, 'Addresses a key 18pt skill gap for backend engineering roles.'),
('student_1', 'Tell me about your last project', 'Communication', 'Communication · priority 03', '15 min', 'Priority 03', true, 'Practicing behavioral narrative structure with the STAR method.'),
('student_1', 'Timed aptitude: data interpretation', 'Aptitude', 'Aptitude · priority 04', '20 min', 'Priority 04', false, 'Boosts preliminary assessment test clearance probability.');

-- Seed Interview Questions
INSERT INTO public.prep_interview_questions (title, question_type, question_text, hints, suggested_keywords, target_company_id)
VALUES 
('Performance & Architecture', 'behavioral + technical', 'Tell me about a time you improved the performance of a system or application. What did you measure, and what changed?', '["Mention baseline metrics (latency, memory, or throughput)", "Explain the root cause identified with profiling tools", "Describe the architectural or algorithmic optimization applied", "Conclude with the quantifiable percentage improvement"]'::jsonb, '["latency", "profiling", "caching", "indexing", "throughput", "bottleneck", "optimization"]'::jsonb, 'target_rz'),
('Scalability & API Design', 'technical system design', 'How would you design a rate limiter for a high-traffic payment API like Razorpay? What data store and algorithm would you choose?', '["Compare Token Bucket vs Leaky Bucket vs Sliding Window Counter", "Consider Redis for in-memory atomicity and TTLs", "Address distributed race conditions with Lua scripts"]'::jsonb, '["token bucket", "redis", "sliding window", "rate limit", "429 too many requests", "concurrency"]'::jsonb, 'target_rz'),
('Conflict & Team Collaboration', 'behavioral STAR', 'Describe a situation where you had a disagreement with a team member on a technical decision. How did you resolve it?', '["State the Situation and Task objectively without blaming", "Detail the Action: data-driven benchmarks or architectural trade-offs", "Show the constructive Result and impact on team trust"]'::jsonb, '["situation", "benchmarking", "trade-offs", "alignment", "collaboration", "outcome"]'::jsonb, 'target_ms');

-- Seed records directly into the public.prepAI universal table
INSERT INTO public."prepAI" (record_type, name, title, category, score, is_completed, payload)
VALUES 
('profile', 'Arjun Shah', 'Student Placement Profile', 'Profile', 68, true, '{"department": "Computer Science", "gradYear": 2026, "weeklyDelta": 4, "percentileRank": 18}'::jsonb),
('task', NULL, 'Solve: sliding window patterns', 'Coding', 72, false, '{"time": "45 min", "priority": "Priority 01", "rationale": "Unlocks higher coding confidence for Razorpay."}'::jsonb),
('task', NULL, 'REST API design fundamentals', 'Technical', 64, false, '{"time": "30 min", "priority": "Priority 02", "rationale": "Addresses an 18pt skill gap."}'::jsonb),
('task', NULL, 'Tell me about your last project', 'Communication', 78, true, '{"time": "15 min", "priority": "Priority 03", "rationale": "STAR method narrative structure."}'::jsonb),
('target', 'Razorpay', 'Software Engineer · New Grad', 'Fintech', 68, false, '{"shortCode": "RZ", "matchedSkills": ["Data structures", "Problem solving"]}'::jsonb),
('target', 'Microsoft', 'Software Engineer · New Grad', 'Big Tech', 61, false, '{"shortCode": "MS", "matchedSkills": ["Algorithms", "OOD"]}'::jsonb);
