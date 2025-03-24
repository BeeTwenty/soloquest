
import { useState } from "react";
import { Task, TaskStatus, Priority } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CheckCircle, Circle, Clock, Calendar, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  
  // Sort tasks by priority (high to low) and status (todo first, completed last)
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // First sort by status (todo, in-progress, completed)
    if (a.status !== b.status) {
      if (a.status === TaskStatus.COMPLETED) return 1;
      if (b.status === TaskStatus.COMPLETED) return -1;
      if (a.status === TaskStatus.TODO && b.status === TaskStatus.IN_PROGRESS) return -1;
      if (a.status === TaskStatus.IN_PROGRESS && b.status === TaskStatus.TODO) return 1;
    }
    
    // Then sort by priority (high to low)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority as keyof typeof priorityOrder] - 
           priorityOrder[b.priority as keyof typeof priorityOrder];
  });
  
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
  
  const toggleTaskStatus = (task: Task) => {
    if (!onUpdateTask) return;
    
    const newStatus = 
      task.status === TaskStatus.COMPLETED 
        ? TaskStatus.TODO 
        : task.status === TaskStatus.TODO 
          ? TaskStatus.IN_PROGRESS 
          : TaskStatus.COMPLETED;
    
    onUpdateTask(task.id, { status: newStatus });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
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
      
      <div className="space-y-2">
        {sortedTasks.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No tasks found
          </div>
        ) : (
          sortedTasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "p-3 flex items-start border rounded-md transition-all group hover:border-primary/50",
                task.status === TaskStatus.COMPLETED && "bg-secondary/30"
              )}
            >
              <button
                onClick={() => toggleTaskStatus(task)}
                className="mt-0.5 mr-3 flex-shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {task.status === TaskStatus.COMPLETED ? (
                  <CheckCircle className="h-5 w-5 text-primary" />
                ) : task.status === TaskStatus.IN_PROGRESS ? (
                  <Clock className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      getPriorityColor(task.priority as Priority)
                    )}
                  />
                  <h4
                    className={cn(
                      "font-medium text-sm",
                      task.status === TaskStatus.COMPLETED &&
                        "line-through text-muted-foreground"
                    )}
                  >
                    {task.title}
                  </h4>
                </div>
                
                {task.description && (
                  <p
                    className={cn(
                      "text-sm text-muted-foreground mt-1 line-clamp-2",
                      task.status === TaskStatus.COMPLETED &&
                        "line-through opacity-70"
                    )}
                  >
                    {task.description}
                  </p>
                )}
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center">
                    <Calendar className="mr-1 h-3.5 w-3.5" />
                    {format(new Date(task.updatedAt), "MMM d, yyyy")}
                  </span>
                  
                  <span className="capitalize">
                    {task.status === TaskStatus.IN_PROGRESS ? "In Progress" : task.status}
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
                    <DropdownMenuItem onClick={() => toggleTaskStatus(task)}>
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
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList;
