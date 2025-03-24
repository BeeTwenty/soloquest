
import { useState, useEffect } from "react";
import { db } from "@/utils/db";
import { Project, TaskStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";
import { Calendar, CheckCircle, CircleDashed, Clock, BarChart as BarChartIcon } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";

const Stats = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await db.getProjects();
        setProjects(data);
      } catch (error) {
        console.error("Failed to load projects:", error);
        toast({
          title: "Error",
          description: "Failed to load project data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [toast]);
  
  // Get all tasks from all projects
  const allTasks = projects.flatMap((project) => 
    project.tasks.map((task) => ({ ...task, projectName: project.name }))
  );
  
  // Calculate stats
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const completedProjects = projects.filter((p) => p.status === "completed").length;
  const planningProjects = projects.filter((p) => p.status === "planning").length;
  
  const totalTasks = allTasks.length;
  const todoTasks = allTasks.filter((t) => t.status === TaskStatus.TODO).length;
  const inProgressTasks = allTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length;
  const completedTasks = allTasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
  
  const taskCompletionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Prepare data for charts
  const projectStatusData = [
    { name: "Planning", value: planningProjects },
    { name: "Active", value: activeProjects },
    { name: "Completed", value: completedProjects },
  ].filter(item => item.value > 0);
  
  const taskStatusData = [
    { name: "To Do", value: todoTasks },
    { name: "In Progress", value: inProgressTasks },
    { name: "Completed", value: completedTasks },
  ].filter(item => item.value > 0);
  
  const projectsWithTasksData = projects.map(project => ({
    name: project.name,
    total: project.tasks.length,
    completed: project.tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
    inProgress: project.tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
    todo: project.tasks.filter(t => t.status === TaskStatus.TODO).length,
  })).sort((a, b) => b.total - a.total).slice(0, 5);
  
  // Generate weekly activity data (last 7 days)
  const generateWeeklyData = () => {
    const today = new Date();
    const startDay = startOfWeek(today);
    const data = [];
    
    for (let i = 0; i < 7; i++) {
      const day = addDays(startDay, i);
      const dayTasks = allTasks.filter(task => 
        isSameDay(new Date(task.updatedAt), day)
      );
      
      data.push({
        name: format(day, "EEE"),
        date: format(day, "MMM d"),
        completed: dayTasks.filter(t => t.status === TaskStatus.COMPLETED).length,
        created: dayTasks.length,
      });
    }
    
    return data;
  };
  
  const weeklyData = generateWeeklyData();
  
  // Colors for charts
  const COLORS = ["#0088FE", "#FFBB28", "#00C49F", "#FF8042"];
  const STATUS_COLORS = {
    planning: "#3b82f6",
    active: "#10b981",
    completed: "#8b5cf6",
    todo: "#6b7280",
    "in-progress": "#f59e0b",
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container px-4 max-w-6xl pt-24 pb-16">
          <div className="animate-pulse">Loading statistics...</div>
        </main>
      </div>
    );
  }
  
  if (totalProjects === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container px-4 max-w-6xl pt-24 pb-16">
          <div className="flex flex-col items-center justify-center py-16">
            <BarChartIcon className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No data to display</h2>
            <p className="text-muted-foreground text-center max-w-md">
              Create some projects and add tasks to see your statistics and analytics.
            </p>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container px-4 max-w-6xl pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
          <p className="text-muted-foreground mt-1">
            Insights and analytics for your development journey
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProjects}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {activeProjects} active, {completedProjects} completed
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Task Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskCompletionRate}%</div>
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mt-2">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${taskCompletionRate}%` }}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                To-Do Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todoTasks}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {inProgressTasks} in progress
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTasks}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Out of {totalTasks} total tasks
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Weekly Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          contentStyle={{ 
                            background: 'hsl(var(--background))', 
                            border: '1px solid hsl(var(--border))' 
                          }} 
                          labelStyle={{ fontWeight: 'bold' }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="created" 
                          stroke="#3b82f6" 
                          strokeWidth={2} 
                          activeDot={{ r: 8 }} 
                          name="Tasks Created" 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="completed" 
                          stroke="#10b981" 
                          strokeWidth={2} 
                          activeDot={{ r: 8 }} 
                          name="Tasks Completed" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Project & Task Status</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-center justify-center gap-8">
                  <div className="w-40 h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={projectStatusData}
                          innerRadius={30}
                          outerRadius={60}
                          paddingAngle={5}
                          dataKey="value"
                          nameKey="name"
                          label
                        >
                          {projectStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name) => [`${value} projects`, name]}
                          contentStyle={{ 
                            background: 'hsl(var(--background))', 
                            border: '1px solid hsl(var(--border))' 
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="text-center text-sm font-medium mt-2">Projects</div>
                  </div>
                  
                  <div className="w-40 h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={taskStatusData}
                          innerRadius={30}
                          outerRadius={60}
                          paddingAngle={5}
                          dataKey="value"
                          nameKey="name"
                          label
                        >
                          {taskStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name) => [`${value} tasks`, name]}
                          contentStyle={{ 
                            background: 'hsl(var(--background))', 
                            border: '1px solid hsl(var(--border))' 
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="text-center text-sm font-medium mt-2">Tasks</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="projects" className="animate-fade-in">
            <div className="grid grid-cols-1 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Projects by Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={projectsWithTasksData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          contentStyle={{ 
                            background: 'hsl(var(--background))', 
                            border: '1px solid hsl(var(--border))' 
                          }} 
                        />
                        <Legend />
                        <Bar dataKey="todo" stackId="a" fill="#6b7280" name="To Do" />
                        <Bar dataKey="inProgress" stackId="a" fill="#f59e0b" name="In Progress" />
                        <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Project Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={projectsWithTasksData}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis type="category" dataKey="name" width={150} />
                        <Tooltip 
                          formatter={(value) => [`${value}%`, 'Completion']}
                          contentStyle={{ 
                            background: 'hsl(var(--background))', 
                            border: '1px solid hsl(var(--border))' 
                          }} 
                        />
                        <Bar 
                          dataKey={(entry) => entry.total === 0 ? 0 : Math.round((entry.completed / entry.total) * 100)} 
                          name="Completion Rate" 
                          fill="#3b82f6"
                          label={{ position: 'right', formatter: (value) => `${value}%` }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="tasks" className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Task Status</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center">
                  <div className="h-[200px] w-full max-w-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={taskStatusData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {taskStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name) => [`${value} tasks`, name]}
                          contentStyle={{ 
                            background: 'hsl(var(--background))', 
                            border: '1px solid hsl(var(--border))' 
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-4 mt-6">
                    <div className="flex items-center">
                      <CircleDashed className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">To Do: {todoTasks}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                      <span className="text-sm">In Progress: {inProgressTasks}</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-sm">Completed: {completedTasks}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Task Completion Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => [value, name === "completed" ? "Tasks Completed" : "Tasks Created"]}
                          contentStyle={{ 
                            background: 'hsl(var(--background))', 
                            border: '1px solid hsl(var(--border))' 
                          }} 
                          labelFormatter={(value) => weeklyData.find(d => d.name === value)?.date || value}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="completed" 
                          stroke="#10b981" 
                          strokeWidth={2} 
                          dot={{ fill: '#10b981', strokeWidth: 2 }}
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Stats;
