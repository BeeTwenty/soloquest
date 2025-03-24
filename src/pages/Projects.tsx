import { useState, useEffect } from "react";
import { db } from "@/utils/db";
import { Project, ProjectStatus } from "@/types";
import Navbar from "@/components/Navbar";
import ProjectCard from "@/components/ProjectCard";
import NewProjectDialog from "@/components/NewProjectDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Grid3X3, LayoutList, Plus, Search } from "lucide-react";
import { toast as sonnerToast } from "sonner";

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState<"all" | ProjectStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoading(true);
        const data = await db.getProjects();
        setProjects(data);
        setFilteredProjects(data);
      } catch (error) {
        console.error("Failed to load projects:", error);
        sonnerToast.error("Failed to load projects.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);
  
  useEffect(() => {
    let result = [...projects];
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((project) => project.status === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (project) =>
          project.name.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredProjects(result);
  }, [projects, statusFilter, searchQuery]);
  
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
  
  const handleDeleteProject = async (projectId: string) => {
    try {
      const success = await db.deleteProject(projectId);
      
      if (success) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
        sonnerToast.success("Project deleted successfully!");
      } else {
        throw new Error("Failed to delete project");
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
      sonnerToast.error("Failed to delete project.");
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container px-4 max-w-6xl pt-24 pb-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground mt-1">
              Manage all your solo development projects
            </p>
          </div>
          
          <Button 
            className="mt-4 sm:mt-0"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              className="pl-9 h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <div className="w-40">
              <Select 
                value={statusFilter} 
                onValueChange={(value) => 
                  setStatusFilter(value as "all" | ProjectStatus)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={ProjectStatus.PLANNING}>Planning</SelectItem>
                  <SelectItem value={ProjectStatus.ACTIVE}>Active</SelectItem>
                  <SelectItem value={ProjectStatus.COMPLETED}>Completed</SelectItem>
                  <SelectItem value={ProjectStatus.ARCHIVED}>Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="bg-secondary p-0.5 rounded-md flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 rounded-sm ${
                  viewMode === "grid" ? "bg-background shadow-subtle" : ""
                }`}
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 rounded-sm ${
                  viewMode === "list" ? "bg-background shadow-subtle" : ""
                }`}
                onClick={() => setViewMode("list")}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="py-12 text-center">
            <div className="animate-pulse">Loading projects...</div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== "all"
                ? "No projects match your filters"
                : "No projects found. Create your first project to get started."}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Button 
                className="mt-4"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                compact
                className="hover:bg-muted/30"
              />
            ))}
          </div>
        )}
      </main>
      
      <NewProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
};

export default Projects;
