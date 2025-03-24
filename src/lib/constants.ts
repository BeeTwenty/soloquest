
// Database connection info - will be read from environment variables
export const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "solo_quest",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
};

// App configuration
export const APP_CONFIG = {
  name: "SoloQuest",
  description: "Project planner for solo developers",
  version: "1.0.0",
};

// Demo projects for development
export const DEMO_PROJECTS = [
  {
    id: "1",
    name: "Personal Website",
    description: "Redesign of my personal portfolio website with a blog section",
    status: "active",
    priority: "medium",
    createdAt: new Date("2023-11-10"),
    updatedAt: new Date("2024-03-15"),
    tasks: [
      {
        id: "101",
        title: "Design homepage wireframe",
        status: "completed",
        priority: "medium",
        projectId: "1",
        createdAt: new Date("2023-11-10"),
        updatedAt: new Date("2023-11-12"),
      },
      {
        id: "102",
        title: "Implement responsive layout",
        status: "in-progress",
        priority: "high",
        projectId: "1",
        createdAt: new Date("2023-11-15"),
        updatedAt: new Date("2023-11-15"),
      },
      {
        id: "103",
        title: "Add blog functionality",
        status: "todo",
        priority: "medium",
        projectId: "1",
        createdAt: new Date("2023-11-20"),
        updatedAt: new Date("2023-11-20"),
      },
    ],
  },
  {
    id: "2",
    name: "Weather App",
    description: "Mobile weather application with real-time updates and location services",
    status: "planning",
    priority: "low",
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-05"),
    tasks: [
      {
        id: "201",
        title: "Research weather APIs",
        status: "completed",
        priority: "high",
        projectId: "2",
        createdAt: new Date("2024-01-05"),
        updatedAt: new Date("2024-01-07"),
      },
      {
        id: "202",
        title: "Create app design mockups",
        status: "todo",
        priority: "medium",
        projectId: "2",
        createdAt: new Date("2024-01-10"),
        updatedAt: new Date("2024-01-10"),
      },
    ],
  },
  {
    id: "3",
    name: "Budget Tracker",
    description: "Personal finance application to track expenses and savings",
    status: "completed",
    priority: "medium",
    createdAt: new Date("2023-09-01"),
    updatedAt: new Date("2023-12-15"),
    tasks: [
      {
        id: "301",
        title: "Design database schema",
        status: "completed",
        priority: "high",
        projectId: "3",
        createdAt: new Date("2023-09-01"),
        updatedAt: new Date("2023-09-05"),
      },
      {
        id: "302",
        title: "Implement user authentication",
        status: "completed",
        priority: "high",
        projectId: "3",
        createdAt: new Date("2023-09-10"),
        updatedAt: new Date("2023-09-20"),
      },
      {
        id: "303",
        title: "Add expense tracking feature",
        status: "completed",
        priority: "medium",
        projectId: "3",
        createdAt: new Date("2023-09-25"),
        updatedAt: new Date("2023-10-10"),
      },
      {
        id: "304",
        title: "Create reporting dashboard",
        status: "completed",
        priority: "medium",
        projectId: "3",
        createdAt: new Date("2023-10-15"),
        updatedAt: new Date("2023-11-01"),
      },
    ],
  },
];
