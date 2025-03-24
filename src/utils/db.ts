
import { Project, Task, ProjectStatus, TaskStatus, Priority } from "../types";
import { DEMO_PROJECTS } from "../lib/constants";
import { toast } from "sonner";

// Configuration for database connection
// These should be configured in your hosting environment
const DB_CONFIG = {
  host: import.meta.env.VITE_DB_HOST || "localhost",
  port: import.meta.env.VITE_DB_PORT || 5432,
  database: import.meta.env.VITE_DB_NAME || "task_manager",
  user: import.meta.env.VITE_DB_USER || "postgres",
  password: import.meta.env.VITE_DB_PASSWORD || "postgres"
};

// This is a DatabaseClient implementation designed to work with a PostgreSQL database
// It provides a fallback to in-memory storage when not connected to a database
class DatabaseClient {
  private isConnected: boolean = false;
  private projects: Project[] = [];
  private pool: any = null;

  constructor() {
    console.log("Database client initialized with config:", {
      host: DB_CONFIG.host,
      port: DB_CONFIG.port,
      database: DB_CONFIG.database,
      user: DB_CONFIG.user,
      // Password is deliberately not logged
    });
  }

  async connect(): Promise<boolean> {
    try {
      console.log("Connecting to database...");
      
      // Try to dynamically import pg (PostgreSQL client)
      try {
        const pg = await import('pg');
        const { Pool } = pg.default || pg;
        
        this.pool = new Pool(DB_CONFIG);
        await this.pool.query('SELECT NOW()'); // Test connection
        this.isConnected = true;
        console.log("Connected to database successfully");
      } catch (importError) {
        console.warn("Could not import pg package or connect to PostgreSQL. Using fallback mode.", importError);
        // Fallback to demo data for development or when DB is not available
        this.projects = DEMO_PROJECTS as Project[];
        this.isConnected = true;
      }
      
      return true;
    } catch (error) {
      console.error("Failed to connect to database:", error);
      // Fallback to demo data
      this.projects = DEMO_PROJECTS as Project[];
      this.isConnected = true;
      return true; // Return true to allow the app to continue functioning
    }
  }

  // Helper method to handle database operations with fallback
  private async executeQuery<T>(
    operation: () => Promise<T>, 
    fallback: () => T
  ): Promise<T> {
    if (!this.isConnected) {
      await this.connect();
    }
    
    if (this.pool) {
      try {
        return await operation();
      } catch (error) {
        console.error("Database operation failed:", error);
        toast("Database operation failed. Using fallback data.");
        return fallback();
      }
    } else {
      // Use in-memory fallback
      return fallback();
    }
  }

  async getProjects(): Promise<Project[]> {
    return this.executeQuery(
      async () => {
        // Database implementation
        const result = await this.pool.query(`
          SELECT p.id, p.name, p.description, p.status, p.priority, 
                 p.created_at as "createdAt", p.updated_at as "updatedAt"
          FROM projects p
          ORDER BY p.updated_at DESC
        `);
        
        const projects = result.rows;
        
        // For each project, fetch its tasks
        for (const project of projects) {
          const tasksResult = await this.pool.query(`
            SELECT t.id, t.title, t.description, t.status, t.priority, 
                   t.due_date as "dueDate", t.created_at as "createdAt", 
                   t.updated_at as "updatedAt", t.project_id as "projectId"
            FROM tasks t
            WHERE t.project_id = $1
            ORDER BY 
              CASE 
                WHEN t.priority = 'high' THEN 1
                WHEN t.priority = 'medium' THEN 2
                WHEN t.priority = 'low' THEN 3
              END,
              t.updated_at DESC
          `, [project.id]);
          
          project.tasks = tasksResult.rows;
        }
        
        return projects;
      },
      () => this.projects
    );
  }

  async getProject(id: string): Promise<Project | null> {
    return this.executeQuery(
      async () => {
        // Database implementation
        const result = await this.pool.query(`
          SELECT p.id, p.name, p.description, p.status, p.priority, 
                 p.created_at as "createdAt", p.updated_at as "updatedAt"
          FROM projects p
          WHERE p.id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
          return null;
        }
        
        const project = result.rows[0];
        
        // Fetch tasks for this project
        const tasksResult = await this.pool.query(`
          SELECT t.id, t.title, t.description, t.status, t.priority, 
                 t.due_date as "dueDate", t.created_at as "createdAt", 
                 t.updated_at as "updatedAt", t.project_id as "projectId"
          FROM tasks t
          WHERE t.project_id = $1
          ORDER BY 
            CASE 
              WHEN t.priority = 'high' THEN 1
              WHEN t.priority = 'medium' THEN 2
              WHEN t.priority = 'low' THEN 3
            END,
            t.updated_at DESC
        `, [id]);
        
        project.tasks = tasksResult.rows;
        return project;
      },
      () => {
        const project = this.projects.find(p => p.id === id) || null;
        return project;
      }
    );
  }

  async createProject(project: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project> {
    return this.executeQuery(
      async () => {
        // Database implementation
        const now = new Date();
        const result = await this.pool.query(`
          INSERT INTO projects (name, description, status, priority, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id, name, description, status, priority, 
                   created_at as "createdAt", updated_at as "updatedAt"
        `, [
          project.name, 
          project.description, 
          project.status, 
          project.priority, 
          now, 
          now
        ]);
        
        const newProject = result.rows[0];
        newProject.tasks = [];
        return newProject;
      },
      () => {
        const newProject: Project = {
          ...project,
          id: Math.random().toString(36).substring(2, 9),
          createdAt: new Date(),
          updatedAt: new Date(),
          tasks: []
        };
        
        this.projects.push(newProject);
        return newProject;
      }
    );
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    return this.executeQuery(
      async () => {
        // Get current project to merge with updates
        const currentProject = await this.getProject(id);
        if (!currentProject) return null;
        
        const now = new Date();
        
        // Database implementation
        const result = await this.pool.query(`
          UPDATE projects
          SET name = $1, description = $2, status = $3, priority = $4, updated_at = $5
          WHERE id = $6
          RETURNING id, name, description, status, priority, 
                   created_at as "createdAt", updated_at as "updatedAt"
        `, [
          updates.name || currentProject.name,
          updates.description || currentProject.description,
          updates.status || currentProject.status,
          updates.priority || currentProject.priority,
          now,
          id
        ]);
        
        if (result.rows.length === 0) {
          return null;
        }
        
        const updatedProject = result.rows[0];
        // Maintain the tasks
        updatedProject.tasks = currentProject.tasks;
        return updatedProject;
      },
      () => {
        const index = this.projects.findIndex(p => p.id === id);
        if (index === -1) return null;
        
        const updatedProject = {
          ...this.projects[index],
          ...updates,
          updatedAt: new Date(),
        };
        
        this.projects[index] = updatedProject;
        return updatedProject;
      }
    );
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.executeQuery(
      async () => {
        // Database implementation
        // First, delete all tasks associated with this project
        await this.pool.query(`
          DELETE FROM tasks
          WHERE project_id = $1
        `, [id]);
        
        // Then delete the project
        const result = await this.pool.query(`
          DELETE FROM projects
          WHERE id = $1
          RETURNING id
        `, [id]);
        
        return result.rows.length > 0;
      },
      () => {
        const initialLength = this.projects.length;
        this.projects = this.projects.filter(p => p.id !== id);
        return this.projects.length < initialLength;
      }
    );
  }

  async createTask(
    projectId: string, 
    task: Omit<Task, "id" | "createdAt" | "updatedAt" | "projectId">
  ): Promise<Task | null> {
    return this.executeQuery(
      async () => {
        // First check if project exists
        const projectExists = await this.pool.query(`
          SELECT id FROM projects WHERE id = $1
        `, [projectId]);
        
        if (projectExists.rows.length === 0) {
          return null;
        }
        
        const now = new Date();
        const dueDate = task.dueDate || null;
        
        // Database implementation
        const result = await this.pool.query(`
          INSERT INTO tasks (
            title, description, status, priority, due_date, created_at, updated_at, project_id
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id, title, description, status, priority, 
                   due_date as "dueDate", created_at as "createdAt", 
                   updated_at as "updatedAt", project_id as "projectId"
        `, [
          task.title,
          task.description || '',
          task.status,
          task.priority,
          dueDate,
          now,
          now,
          projectId
        ]);
        
        return result.rows[0];
      },
      () => {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return null;
        
        const newTask: Task = {
          ...task,
          id: Math.random().toString(36).substring(2, 9),
          projectId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        project.tasks.push(newTask);
        return newTask;
      }
    );
  }

  async updateTask(projectId: string, taskId: string, updates: Partial<Task>): Promise<Task | null> {
    return this.executeQuery(
      async () => {
        // Get current task to merge with updates
        const currentTask = await this.pool.query(`
          SELECT t.id, t.title, t.description, t.status, t.priority, 
                 t.due_date as "dueDate", t.created_at as "createdAt", 
                 t.updated_at as "updatedAt", t.project_id as "projectId"
          FROM tasks t
          WHERE t.id = $1 AND t.project_id = $2
        `, [taskId, projectId]);
        
        if (currentTask.rows.length === 0) {
          return null;
        }
        
        const task = currentTask.rows[0];
        const now = new Date();
        const dueDate = updates.dueDate || task.dueDate || null;
        
        // Database implementation
        const result = await this.pool.query(`
          UPDATE tasks
          SET title = $1, description = $2, status = $3, priority = $4, 
              due_date = $5, updated_at = $6
          WHERE id = $7 AND project_id = $8
          RETURNING id, title, description, status, priority, 
                   due_date as "dueDate", created_at as "createdAt", 
                   updated_at as "updatedAt", project_id as "projectId"
        `, [
          updates.title || task.title,
          updates.description !== undefined ? updates.description : task.description,
          updates.status || task.status,
          updates.priority || task.priority,
          dueDate,
          now,
          taskId,
          projectId
        ]);
        
        if (result.rows.length === 0) {
          return null;
        }
        
        return result.rows[0];
      },
      () => {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return null;
        
        const taskIndex = project.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return null;
        
        const updatedTask = {
          ...project.tasks[taskIndex],
          ...updates,
          updatedAt: new Date(),
        };
        
        project.tasks[taskIndex] = updatedTask;
        return updatedTask;
      }
    );
  }

  async deleteTask(projectId: string, taskId: string): Promise<boolean> {
    return this.executeQuery(
      async () => {
        // Database implementation
        const result = await this.pool.query(`
          DELETE FROM tasks
          WHERE id = $1 AND project_id = $2
          RETURNING id
        `, [taskId, projectId]);
        
        return result.rows.length > 0;
      },
      () => {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return false;
        
        const initialLength = project.tasks.length;
        project.tasks = project.tasks.filter(t => t.id !== taskId);
        return project.tasks.length < initialLength;
      }
    );
  }

  async disconnect(): Promise<void> {
    console.log("Disconnecting from database...");
    if (this.pool) {
      await this.pool.end();
    }
    this.isConnected = false;
  }
}

// Create a singleton database client
export const db = new DatabaseClient();
