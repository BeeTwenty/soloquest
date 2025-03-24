import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "@/utils/db";
import { Project, TaskStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import ProjectCard from "@/components/ProjectCard";
import TaskList from "@/components/TaskList";
import NewProjectDialog from "@/components/NewProjectDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, Plus, BarChart, FolderKanban, CheckCircle, Clock, Circle } from "lucide-react";
import { toast as sonnerToast } from "sonner";

const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await db.getProjects();
        setProjects(data);
      } catch (error) {
        console.error("Failed to load projects:", error);
        sonnerToast.error("Failed to load projects.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);
  
  const handleCreateProject = async (projectData: any) => {
    try {
      const newProject = await db.createProject(projectData);
      setProjects((prev) => [...prev, newProject]);
      sonnerToast.success("Project created successfully!");
    } catch (error) {
      console.error("Failed to create project:", error);
      sonnerToast.error("Failed to create project.");
    }
  };
  
  // Get recent projects (last 3)
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);
  
  // Get all tasks from all projects
  const allTasks = projects.flatMap((project) => 
    project.tasks.map((task) => ({ ...task, projectName: project.name }))
  );
  
  // Get recent tasks (last 5)
  const recentTasks = [...allTasks]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);
  
  // Calculate stats
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const completedProjects = projects.filter((p) => p.status === "completed").length;
  
  const totalTasks = allTasks.length;
  const todoTasks = allTasks.filter((t) => t.status === TaskStatus.TODO).length;
  const inProgressTasks = allTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length;
  const completedTasks = allTasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
  
  const taskCompletionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container px-4 max-w-6xl pt-24 pb-16">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Your solo development quest overview
            </p>
          </div>
          
          <Button 
            className="mt-4 md:mt-0"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{totalProjects}</div>
                <FolderKanban className="h-8 w-8 text-muted-foreground/40" />
              </div>
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
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{taskCompletionRate}%</div>
                <CheckCircle className="h-8 w-8 text-muted-foreground/40" />
              </div>
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
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{todoTasks}</div>
                <Circle className="h-8 w-8 text-muted-foreground/40" />
              </div>
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
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{completedTasks}</div>
                <BarChart className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0}% of total
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="animate-fade-in">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
              {isLoading ? (
                <div className="col-span-full text-center py-12">
                  <div className="animate-pulse">Loading projects...</div>
                </div>
              ) : recentProjects.length === 0 ? (
                <div className="col-span-full">
                  <Card className="border-dashed">
                    <CardContent className="pt-6 text-center flex flex-col items-center">
                      <div className="rounded-full bg-primary/10 p-3 mb-3">
                        <FolderKanban className="h-6 w-6 text-primary/80" />
                      </div>
                      <CardTitle className="text-xl mb-2">No projects yet</CardTitle>
                      <CardDescription className="mb-4 max-w-md mx-auto">
                        Create your first project to get started tracking your 
                        solo development journey.
                      </CardDescription>
                      <Button
                        onClick={() => setIsCreateDialogOpen(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        New Project
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <>
                  {recentProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                  
                  {recentProjects.length > 0 && recentProjects.length < 3 && (
                    <Card className="border-dashed hover:border-primary/50 transition-colors">
                      <CardContent className="pt-6 h-full flex flex-col items-center justify-center text-center">
                        <div className="rounded-full bg-primary/10 p-3 mb-3">
                          <Plus className="h-5 w-5 text-primary/70" />
                        </div>
                        <p className="text-muted-foreground mb-4">Add another project</p>
                        <Button
                          variant="outline"
                          onClick={() => setIsCreateDialogOpen(true)}
                        >
                          Create Project
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
            
            {recentProjects.length > 0 && (
              <div className="mt-4 text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/projects" className="flex items-center text-muted-foreground hover:text-foreground">
                    View all projects
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
            
            {recentProjects.length > 0 && (
              <div className="mt-10">
                <TaskList tasks={recentTasks} />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recent" className="animate-fade-in">
            <div className="mt-6 space-y-8">
              <div>
                <h3 className="font-medium text-lg mb-4">
                  Recent Projects
                </h3>
                <div className="space-y-3">
                  {recentProjects.map((project) => (
                    <Link 
                      key={project.id} 
                      to={`/projects/${project.id}`}
                      className="block"
                    >
                      <Card className="hover:bg-muted/30 transition-colors">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{project.name}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                              {project.description}
                            </p>
                          </div>
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="shrink-0"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-lg mb-4">
                  Recent Tasks
                </h3>
                <TaskList tasks={recentTasks} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <NewProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
};

export default Dashboard;
