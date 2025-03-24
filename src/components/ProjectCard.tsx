
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Project, TaskStatus } from "@/types";
import { cn } from "@/lib/utils";
import { 
  Calendar, 
  CheckCircle, 
  CircleDashed, 
  Clock, 
  MoreHorizontal 
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ProjectCardProps = {
  project: Project;
  compact?: boolean;
  className?: string;
};

const ProjectCard = ({ project, compact = false, className }: ProjectCardProps) => {
  // Calculate project progress
  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter(
    (task) => task.status === TaskStatus.COMPLETED
  ).length;
  
  const progress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Get status color
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
  
  // Get priority indicator
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

  return (
    <Card 
      className={cn(
        "group overflow-hidden transition-all duration-200 hover:shadow-elevation",
        className
      )}
    >
      <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between">
        <div className="flex items-start space-x-2">
          <div className={cn("w-2 h-2 mt-1.5 rounded-full", getPriorityIndicator(project.priority))} />
          <div>
            <Link to={`/projects/${project.id}`} className="inline-block">
              <h3 className="font-medium text-lg leading-tight hover:text-primary/80 transition-colors">
                {project.name}
              </h3>
            </Link>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <Badge 
                variant="outline" 
                className={cn("text-xs font-normal capitalize px-1.5 py-0 h-5 rounded", 
                  getStatusColor(project.status)
                )}
              >
                {project.status}
              </Badge>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(project.updatedAt), "MMM d, yyyy")}
              </div>
            </div>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 opacity-50 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <Link to={`/projects/${project.id}`} className="flex w-full">
                View details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Edit project</DropdownMenuItem>
            <DropdownMenuItem>Add task</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Delete project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      {!compact && (
        <CardContent className="p-4 pt-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
          
          <div className="mt-3 mb-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardContent>
      )}
      
      <CardFooter className="p-4 pt-0 flex-wrap gap-y-2 text-xs">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{completedTasks} completed</span>
          </div>
          <div className="flex items-center gap-1">
            <CircleDashed className="w-3.5 h-3.5" />
            <span>{totalTasks - completedTasks} remaining</span>
          </div>
        </div>
        
        {!compact && (
          <div className="ml-auto">
            <Button size="sm" variant="outline" className="h-8 text-xs">
              <Clock className="mr-1 h-3.5 w-3.5" />
              View Tasks
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
