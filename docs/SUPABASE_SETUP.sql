-- ==============================================================================
-- AI Editorial Workspace — Supabase / PostgreSQL Production Schema
-- Execute in the Supabase SQL Editor to initialize cloud persistence
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Research Projects Table
CREATE TABLE IF NOT EXISTS editorial_projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'collecting',
    sources JSONB NOT NULL DEFAULT '[]'::jsonb,
    brief JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Writing Drafts Table
CREATE TABLE IF NOT EXISTS editorial_drafts (
    id TEXT PRIMARY KEY,
    article_id TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    original_content TEXT NOT NULL,
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Newsletter Articles Table
CREATE TABLE IF NOT EXISTS editorial_articles (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    project_title TEXT NOT NULL,
    angle_id TEXT,
    angle_title TEXT,
    headline TEXT NOT NULL,
    original_headline TEXT,
    content TEXT NOT NULL,
    original_content TEXT,
    word_count INTEGER NOT NULL DEFAULT 0,
    target_word_count INTEGER NOT NULL DEFAULT 400,
    status TEXT NOT NULL DEFAULT 'ready',
    source_links JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON editorial_projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_drafts_updated_at ON editorial_drafts(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_project_id ON editorial_articles(project_id);
CREATE INDEX IF NOT EXISTS idx_articles_updated_at ON editorial_articles(updated_at DESC);

-- 6. Row Level Security (RLS)
ALTER TABLE editorial_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE editorial_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE editorial_articles ENABLE ROW LEVEL SECURITY;

-- Allow service_role key full CRUD access
CREATE POLICY "Service Role Full Access Projects" ON editorial_projects
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service Role Full Access Drafts" ON editorial_drafts
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service Role Full Access Articles" ON editorial_articles
    FOR ALL USING (auth.role() = 'service_role');
