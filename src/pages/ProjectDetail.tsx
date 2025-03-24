import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { db } from "@/utils/db";
import { Project, Task, TaskStatus, Priority } from "@/types";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import TaskList from "@/components/TaskList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  CircleDashed,
  Clock,
  Edit2,
  Plus,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast as sonnerToast } from "sonner";
import { cn } from "@/lib/utils";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
  });
  const { toast } = useToast();
  
  useEffect(() => {
    const loadProject = async () => {
      if (!id) return;
      
      try {
        const data = await db.getProject(id);
        setProject(data);
      } catch (error) {
        console.error("Failed to load project:", error);
        toast({
          title: "Error",
          description: "Failed to load project details.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [id, toast]);
  
  const handleTaskFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTaskFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleTaskSelectChange = (name: string, value: string) => {
    if (name === "priority") {
      setTaskFormData((prev) => ({ ...prev, [name]: value as Priority }));
    } else {
      setTaskFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !project) return;
    if (!taskFormData.title.trim()) {
      sonnerToast.error("Task title is required");
      return;
    }
    
    try {
      const newTask = await db.createTask(id, taskFormData);
      
      if (newTask) {
        // Update the local state
        setProject((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            tasks: [...prev.tasks, newTask],
          };
        });
        
        // Reset form and close dialog
        setTaskFormData({
          title: "",
          description: "",
          status: TaskStatus.TODO,
          priority: Priority.MEDIUM,
        });
        
        setIsAddTaskDialogOpen(false);
        sonnerToast.success("Task added successfully");
      }
    } catch (error) {
      console.error("Failed to add task:", error);
      sonnerToast.error("Failed to add task");
    }
  };
  
  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!id || !project) return;
    
    try {
      const updatedTask = await db.updateTask(id, taskId, updates);
      
      if (updatedTask) {
        // Update the local state
        setProject((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            tasks: prev.tasks.map((task) =>
              task.id === taskId ? { ...task, ...updates } : task
            ),
          };
        });
        
        sonnerToast.success("Task updated successfully");
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      sonnerToast.error("Failed to update task");
    }
  };
  
  const handleDeleteTask = async (taskId: string) => {
    if (!id || !project) return;
    
    try {
      const success = await db.deleteTask(id, taskId);
      
      if (success) {
        // Update the local state
        setProject((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            tasks: prev.tasks.filter((task) => task.id !== taskId),
          };
        });
        
        sonnerToast.success("Task deleted successfully");
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
      sonnerToast.error("Failed to delete task");
    }
  };
  
  const handleDeleteProject = async () => {
    if (!id) return;
    
    try {
      const success = await db.deleteProject(id);
      
      if (success) {
        setIsDeleteConfirmOpen(false);
        navigate("/projects");
        sonnerToast.success("Project deleted successfully");
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
      sonnerToast.error("Failed to delete project");
    }
  };
  
  const getTotalTasks = () => project?.tasks.length || 0;
  const getCompletedTasks = () => 
    project?.tasks.filter((task) => task.status === TaskStatus.COMPLETED).length || 0;
  const getInProgressTasks = () => 
    project?.tasks.filter((task) => task.status === TaskStatus.IN_PROGRESS).length || 0;
  const getTodoTasks = () => 
    project?.tasks.filter((task) => task.status === TaskStatus.TODO).length || 0;
  
  const getProgress = () => {
    const total = getTotalTasks();
    const completed = getCompletedTasks();
    return total ? Math.round((completed / total) * 100) : 0;
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
      case "active":
        return "bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
      case "completed":
        return "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800";
      case "archived":
        return "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800";
    }
  };
  
  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container px-4 max-w-6xl pt-24 pb-16">
          <div className="animate-pulse">Loading project details...</div>
        </main>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container px-4 max-w-6xl pt-24 pb-16">
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold mb-2">Project not found</h2>
            <p className="text-muted-foreground mb-6">
              The project you're looking for doesn't exist or has been deleted.
            </p>
            <Button asChild>
              <Link to="/projects">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Projects
              </Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container px-4 max-w-6xl pt-24 pb-16">
        <div className="flex items-center gap-2 text-muted-foreground mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-auto hover:bg-transparent"
            asChild
          >
            <Link to="/projects">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Projects
            </Link>
          </Button>
          <span>/</span>
          <span className="truncate">{project.name}</span>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div 
                  className={cn(
                    "w-3 h-3 mt-2 rounded-full", 
                    getPriorityIndicator(project.priority)
                  )} 
                />
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    {project.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs font-normal capitalize px-2 py-0.5", 
                        getStatusColor(project.status)
                      )}
                    >
                      {project.status}
                    </Badge>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Updated {format(new Date(project.updatedAt), "MMM d, yyyy")}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="icon"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-muted-foreground">{project.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-2xl font-bold">{getTotalTasks()}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Completed
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-2xl font-bold">{getCompletedTasks()}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-2xl font-bold">{getProgress()}%</div>
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${getProgress()}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-8">
              <Tabs defaultValue="all">
                <div className="flex items-center justify-between mb-6">
                  <TabsList>
                    <TabsTrigger value="all">
                      All Tasks ({getTotalTasks()})
                    </TabsTrigger>
                    <TabsTrigger value="todo">
                      To Do ({getTodoTasks()})
                    </TabsTrigger>
                    <TabsTrigger value="inprogress">
                      In Progress ({getInProgressTasks()})
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                      Completed ({getCompletedTasks()})
                    </TabsTrigger>
                  </TabsList>
                  
                  <Button 
                    size="sm"
                    onClick={() => setIsAddTaskDialogOpen(true)}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Task
                  </Button>
                </div>
                
                <TabsContent value="all" className="animate-fade-in mt-0">
                  <TaskList 
                    tasks={project.tasks}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={handleDeleteTask}
                  />
                </TabsContent>
                
                <TabsContent value="todo" className="animate-fade-in mt-0">
                  <TaskList 
                    tasks={project.tasks.filter(t => t.status === TaskStatus.TODO)}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={handleDeleteTask}
                  />
                </TabsContent>
                
                <TabsContent value="inprogress" className="animate-fade-in mt-0">
                  <TaskList 
                    tasks={project.tasks.filter(t => t.status === TaskStatus.IN_PROGRESS)}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={handleDeleteTask}
                  />
                </TabsContent>
                
                <TabsContent value="completed" className="animate-fade-in mt-0">
                  <TaskList 
                    tasks={project.tasks.filter(t => t.status === TaskStatus.COMPLETED)}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={handleDeleteTask}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <div className="w-full md:w-64 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Project Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs capitalize", 
                        getStatusColor(project.status)
                      )}
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Priority</span>
                    <span className="capitalize">{project.priority}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span>{format(new Date(project.createdAt), "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Last updated</span>
                    <span>{format(new Date(project.updatedAt), "MMM d, yyyy")}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Tasks</span>
                    <span>{getTotalTasks()}</span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CircleDashed className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        <span>To Do</span>
                      </div>
                      <span>{getTodoTasks()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1.5 text-yellow-500" />
                        <span>In Progress</span>
                      </div>
                      <span>{getInProgressTasks()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-primary" />
                        <span>Completed</span>
                      </div>
                      <span>{getCompletedTasks()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setIsAddTaskDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Project
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Project
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleAddTask}>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>
                Add a new task to the "{project.name}" project
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={taskFormData.title}
                  onChange={handleTaskFormChange}
                  placeholder="What needs to be done?"
                  autoFocus
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={taskFormData.description}
                  onChange={handleTaskFormChange}
                  placeholder="Add more details about this task"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={taskFormData.status}
                    onValueChange={(value) => handleTaskSelectChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
                      <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                      <SelectItem value={TaskStatus.COMPLETED}>Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={taskFormData.priority}
                    onValueChange={(value) => handleTaskSelectChange("priority", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddTaskDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone
              and all tasks within the project will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteProject}
            >
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectDetail;
