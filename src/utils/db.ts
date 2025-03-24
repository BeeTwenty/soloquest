
import { DB_CONFIG } from "../lib/constants";
import { Project, Task, ProjectStatus, TaskStatus, Priority } from "../types";
import { DEMO_PROJECTS } from "../lib/constants";

// This is a placeholder for the actual database implementation
// It will be replaced with a real PostgreSQL client in production
class DatabaseClient {
  private isConnected: boolean = false;
  private projects: Project[] = [];

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
      // In a real implementation, this would connect to PostgreSQL
      
      // For development, we'll use demo data
      this.projects = DEMO_PROJECTS as Project[];
      this.isConnected = true;
      
      console.log("Connected to database successfully");
      return true;
    } catch (error) {
      console.error("Failed to connect to database:", error);
      this.isConnected = false;
      return false;
    }
  }

  async getProjects(): Promise<Project[]> {
    if (!this.isConnected) {
      await this.connect();
    }
    return this.projects;
  }

  async getProject(id: string): Promise<Project | null> {
    if (!this.isConnected) {
      await this.connect();
    }
    
    const project = this.projects.find(p => p.id === id);
    return project || null;
  }

  async createProject(project: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project> {
    if (!this.isConnected) {
      await this.connect();
    }
    
    const newProject: Project = {
      ...project,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.projects.push(newProject);
    return newProject;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    if (!this.isConnected) {
      await this.connect();
    }
    
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

  async deleteProject(id: string): Promise<boolean> {
    if (!this.isConnected) {
      await this.connect();
    }
    
    const initialLength = this.projects.length;
    this.projects = this.projects.filter(p => p.id !== id);
    
    return this.projects.length < initialLength;
  }

  async createTask(
    projectId: string, 
    task: Omit<Task, "id" | "createdAt" | "updatedAt" | "projectId">
  ): Promise<Task | null> {
    if (!this.isConnected) {
      await this.connect();
    }
    
    const project = await this.getProject(projectId);
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

  async updateTask(projectId: string, taskId: string, updates: Partial<Task>): Promise<Task | null> {
    if (!this.isConnected) {
      await this.connect();
    }
    
    const project = await this.getProject(projectId);
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

  async deleteTask(projectId: string, taskId: string): Promise<boolean> {
    if (!this.isConnected) {
      await this.connect();
    }
    
    const project = await this.getProject(projectId);
    if (!project) return false;
    
    const initialLength = project.tasks.length;
    project.tasks = project.tasks.filter(t => t.id !== taskId);
    
    return project.tasks.length < initialLength;
  }

  async disconnect(): Promise<void> {
    console.log("Disconnecting from database...");
    this.isConnected = false;
  }
}

// Create a singleton database client
export const db = new DatabaseClient();
