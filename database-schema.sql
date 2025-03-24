
-- Database schema for Task Manager application

-- Create enum types
CREATE TYPE project_status AS ENUM ('planning', 'active', 'completed', 'archived');
CREATE TYPE task_status AS ENUM ('todo', 'in-progress', 'completed');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high');

-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status project_status NOT NULL DEFAULT 'planning',
  priority priority_level NOT NULL DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'todo',
  priority priority_level NOT NULL DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_projects_updated_at ON projects(updated_at);
CREATE INDEX idx_tasks_updated_at ON tasks(updated_at);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);

-- Sample data (optional)
INSERT INTO projects (name, description, status, priority)
VALUES 
  ('Personal Website', 'Redesign my personal portfolio website with React and TailwindCSS', 'active', 'high'),
  ('Budget Tracker', 'Mobile app to track personal expenses and savings', 'planning', 'medium'),
  ('Recipe Collection', 'Web application to store and organize family recipes', 'completed', 'low');

-- Sample tasks for Personal Website project
INSERT INTO tasks (project_id, title, description, status, priority, due_date)
SELECT 
  (SELECT id FROM projects WHERE name = 'Personal Website'),
  'Design homepage layout',
  'Create wireframes and mockups for the homepage',
  'completed',
  'high',
  NOW() + INTERVAL '1 day'
UNION ALL
SELECT 
  (SELECT id FROM projects WHERE name = 'Personal Website'),
  'Implement responsive navbar',
  'Create a mobile-friendly navigation menu',
  'in-progress',
  'medium',
  NOW() + INTERVAL '3 days'
UNION ALL
SELECT 
  (SELECT id FROM projects WHERE name = 'Personal Website'),
  'Add portfolio section',
  'Create a grid layout to showcase projects',
  'todo',
  'medium',
  NOW() + INTERVAL '5 days';

-- Sample tasks for Budget Tracker project
INSERT INTO tasks (project_id, title, description, status, priority, due_date)
SELECT 
  (SELECT id FROM projects WHERE name = 'Budget Tracker'),
  'Design database schema',
  'Plan the data structure for storing financial transactions',
  'todo',
  'high',
  NOW() + INTERVAL '2 days'
UNION ALL
SELECT 
  (SELECT id FROM projects WHERE name = 'Budget Tracker'),
  'Create expense entry form',
  'Build form for adding new expenses with categories',
  'todo',
  'medium',
  NOW() + INTERVAL '7 days';

-- Sample tasks for Recipe Collection project
INSERT INTO tasks (project_id, title, description, status, priority)
SELECT 
  (SELECT id FROM projects WHERE name = 'Recipe Collection'),
  'Deploy to production',
  'Deploy the finished application to Vercel',
  'completed',
  'high'
UNION ALL
SELECT 
  (SELECT id FROM projects WHERE name = 'Recipe Collection'),
  'Add search functionality',
  'Implement recipe search by ingredients and tags',
  'completed',
  'medium'
UNION ALL
SELECT 
  (SELECT id FROM projects WHERE name = 'Recipe Collection'),
  'Add user authentication',
  'Implement login and registration using Auth0',
  'completed',
  'medium';
