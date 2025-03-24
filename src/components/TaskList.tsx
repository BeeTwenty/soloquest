
import { useState } from "react";
import { Task, TaskStatus, Priority } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CheckCircle, Circle, Clock, Calendar, Edit, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";

type TaskListProps = {
  tasks: Task[];
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask?: (taskId: string) => void;
};

const TaskList = ({ tasks, onUpdateTask, onDeleteTask }: TaskListProps) => {
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  
  const filteredTasks = tasks.filter(
    (task) => filter === "all" || task.status === filter
  );
  
  // Sort tasks by priority (high to low)
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Sort by priority (high to low)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority as keyof typeof priorityOrder] - 
           priorityOrder[b.priority as keyof typeof priorityOrder];
  });
  
  // Group tasks by status for the Kanban view
  const todoTasks = sortedTasks.filter(task => task.status === TaskStatus.TODO);
  const inProgressTasks = sortedTasks.filter(task => task.status === TaskStatus.IN_PROGRESS);
  const completedTasks = sortedTasks.filter(task => task.status === TaskStatus.COMPLETED);
  
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.HIGH:
        return "bg-red-500";
      case Priority.MEDIUM:
        return "bg-yellow-500";
      case Priority.LOW:
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };
  
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId && onUpdateTask) {
      onUpdateTask(taskId, { status: newStatus });
    }
  };
  
  const TaskCard = ({ task }: { task: Task }) => {
    return (
      <div
        className="p-3 bg-card border rounded-md transition-all group hover:border-primary/50 mb-3 shadow-sm"
        draggable
        onDragStart={(e) => handleDragStart(e, task.id)}
      >
        <div className="flex items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  getPriorityColor(task.priority as Priority)
                )}
              />
              <h4 className="font-medium text-sm">
                {task.title}
              </h4>
            </div>
            
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center">
                <Calendar className="mr-1 h-3.5 w-3.5" />
                {format(new Date(task.updatedAt), "MMM d, yyyy")}
              </span>
            </div>
          </div>
          
          <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Edit className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  Edit task
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (!onUpdateTask) return;
                    
                    const newStatus = 
                      task.status === TaskStatus.COMPLETED 
                        ? TaskStatus.TODO 
                        : task.status === TaskStatus.TODO 
                          ? TaskStatus.IN_PROGRESS 
                          : TaskStatus.COMPLETED;
                    
                    onUpdateTask(task.id, { status: newStatus });
                  }}
                >
                  {task.status === TaskStatus.COMPLETED 
                    ? "Mark as not completed" 
                    : "Mark as completed"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => onDeleteTask && onDeleteTask(task.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    );
  };
  
  const KanbanColumn = ({ 
    title, 
    icon,
    tasks, 
    status,
    count 
  }: { 
    title: string; 
    icon: React.ReactNode;
    tasks: Task[]; 
    status: TaskStatus;
    count: number;
  }) => {
    return (
      <div 
        className="flex-1 min-w-[250px] max-w-full"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, status)}
      >
        <div className="bg-secondary/40 rounded-md p-3 h-full flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {icon}
              <h3 className="text-sm font-medium">{title}</h3>
              <span className="bg-secondary rounded-full px-2 py-0.5 text-xs">{count}</span>
            </div>
          </div>
          
          <div className="overflow-auto flex-1 pr-1">
            {tasks.length === 0 ? (
              <div className="flex items-center justify-center h-24 border border-dashed rounded-md bg-secondary/20 text-xs text-muted-foreground">
                No tasks
              </div>
            ) : (
              tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Tasks ({filteredTasks.length})</h3>
        
        <div className="flex items-center space-x-2">
          <div className="bg-secondary p-0.5 rounded-md flex text-xs">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-3 py-1.5 rounded-sm font-medium transition-colors",
                filter === "all" 
                  ? "bg-background text-foreground shadow-subtle"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilter(TaskStatus.TODO)}
              className={cn(
                "px-3 py-1.5 rounded-sm font-medium transition-colors",
                filter === TaskStatus.TODO 
                  ? "bg-background text-foreground shadow-subtle"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              To Do
            </button>
            <button
              onClick={() => setFilter(TaskStatus.IN_PROGRESS)}
              className={cn(
                "px-3 py-1.5 rounded-sm font-medium transition-colors",
                filter === TaskStatus.IN_PROGRESS 
                  ? "bg-background text-foreground shadow-subtle"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              In Progress
            </button>
            <button
              onClick={() => setFilter(TaskStatus.COMPLETED)}
              className={cn(
                "px-3 py-1.5 rounded-sm font-medium transition-colors",
                filter === TaskStatus.COMPLETED 
                  ? "bg-background text-foreground shadow-subtle"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Completed
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex space-x-4 overflow-x-auto pb-4">
        <KanbanColumn 
          title="To Do" 
          icon={<Circle className="h-4 w-4 text-muted-foreground" />}
          tasks={todoTasks} 
          status={TaskStatus.TODO}
          count={todoTasks.length}
        />
        <KanbanColumn 
          title="In Progress" 
          icon={<Clock className="h-4 w-4 text-yellow-500" />}
          tasks={inProgressTasks} 
          status={TaskStatus.IN_PROGRESS}
          count={inProgressTasks.length}
        />
        <KanbanColumn 
          title="Completed" 
          icon={<CheckCircle className="h-4 w-4 text-primary" />}
          tasks={completedTasks} 
          status={TaskStatus.COMPLETED}
          count={completedTasks.length}
        />
      </div>
    </div>
  );
};

export default TaskList;
