
-- Create enums for status and priority
CREATE TYPE project_status AS ENUM ('planning', 'active', 'completed', 'archived');
CREATE TYPE task_status AS ENUM ('todo', 'in-progress', 'completed');
CREATE TYPE priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE user_role AS ENUM ('admin', 'user');

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- Will store hashed passwords
  name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create the projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status project_status NOT NULL DEFAULT 'planning',
  priority priority NOT NULL DEFAULT 'medium',
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on projects
CREATE INDEX projects_user_id_idx ON projects(user_id);

-- Create the tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'todo',
  priority priority NOT NULL DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on tasks
CREATE INDEX tasks_project_id_idx ON tasks(project_id);

-- Create a function to hash passwords
CREATE OR REPLACE FUNCTION hash_password(password TEXT) 
RETURNS TEXT AS $$
BEGIN
  -- In a production environment, you would use a proper password hashing function
  -- like pgcrypto's crypt() with a secure algorithm
  -- For demonstration, we're using MD5 which is NOT secure for production
  -- Example with pgcrypto: RETURN crypt(password, gen_salt('bf', 8));
  RETURN MD5(password);
END;
$$ LANGUAGE plpgsql;

-- Add admin user if provided via environment variables
DO $$
BEGIN
  -- Admin user will be created by the application on first run
  -- This is just a placeholder to show the structure
END $$;

-- Create some sample data (optional, for development and testing)
DO $$
DECLARE
  admin_id UUID;
  project_id1 UUID;
  project_id2 UUID;
BEGIN
  -- This is just placeholder data that will only be inserted if no data exists
  -- The actual admin user will be created by the application
END $$;
