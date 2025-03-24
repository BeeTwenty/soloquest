
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { APP_CONFIG, DB_CONFIG } from "@/lib/constants";
import { 
  Database, 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  Palette,
  Shield, 
  Terminal,
  Save
} from "lucide-react";

const Settings = () => {
  const [generalSettings, setGeneralSettings] = useState({
    appName: APP_CONFIG.name,
    theme: "system",
    showEmptyProjects: true,
    showCompletedTasks: true,
    autoSave: true,
  });
  
  const [databaseSettings, setDatabaseSettings] = useState({
    host: DB_CONFIG.host,
    port: DB_CONFIG.port.toString(),
    database: DB_CONFIG.database,
    user: DB_CONFIG.user,
    password: "••••••••", // Masked for security
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    enableNotifications: true,
    taskReminders: true,
    dueDateAlerts: true,
  });
  
  const handleGeneralSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleDatabaseSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDatabaseSettings(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleToggleChange = (name: string, value: boolean) => {
    setGeneralSettings(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleNotificationToggleChange = (name: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSaveGeneralSettings = () => {
    // In a real application, this would save to the server
    toast.success("General settings saved");
  };
  
  const handleSaveDatabaseSettings = () => {
    // In a real application, this would update the database connection
    toast.success("Database settings saved");
    toast.info("Note: Changes to database settings require a restart");
  };
  
  const handleSaveNotificationSettings = () => {
    // In a real application, this would update notification preferences
    toast.success("Notification settings saved");
  };
  
  const exportData = () => {
    // In a real application, this would trigger a data export
    toast.success("Export started. You'll be notified when it's ready.");
  };
  
  const importData = () => {
    // In a real application, this would trigger a file upload dialog
    toast.success("Import feature will be available in a future update");
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container px-4 max-w-4xl pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure your solo project planner
          </p>
        </div>
        
        <Tabs defaultValue="general" className="w-full">
          <div className="flex">
            <div className="w-full md:w-48 shrink-0 flex-col mt-1 pt-2 hidden md:flex">
              <h3 className="text-sm font-medium text-muted-foreground mb-3 pl-4">
                Settings
              </h3>
              <TabsList className="flex flex-col h-auto p-0 bg-transparent">
                <TabsTrigger 
                  value="general" 
                  className="justify-start h-10 px-4 data-[state=active]:bg-secondary"
                >
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  General
                </TabsTrigger>
                <TabsTrigger 
                  value="database" 
                  className="justify-start h-10 px-4 data-[state=active]:bg-secondary"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Database
                </TabsTrigger>
                <TabsTrigger 
                  value="account" 
                  className="justify-start h-10 px-4 data-[state=active]:bg-secondary"
                >
                  <User className="h-4 w-4 mr-2" />
                  User Profile
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="justify-start h-10 px-4 data-[state=active]:bg-secondary"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger 
                  value="appearance" 
                  className="justify-start h-10 px-4 data-[state=active]:bg-secondary"
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Appearance
                </TabsTrigger>
                <TabsTrigger 
                  value="data" 
                  className="justify-start h-10 px-4 data-[state=active]:bg-secondary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Data
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex md:hidden mb-4 w-full">
              <TabsList className="w-full">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="database">Database</TabsTrigger>
                <TabsTrigger value="account">Profile</TabsTrigger>
                <TabsTrigger value="notifications">Notify</TabsTrigger>
                <TabsTrigger value="appearance">Theme</TabsTrigger>
                <TabsTrigger value="data">Data</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-1 md:ml-6">
              <TabsContent value="general" className="animate-fade-in mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">General Settings</CardTitle>
                    <CardDescription>
                      Configure basic application settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="appName">Application Name</Label>
                      <Input
                        id="appName"
                        name="appName"
                        value={generalSettings.appName}
                        onChange={handleGeneralSettingsChange}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Behavior</h3>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="autoSave">Auto Save</Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically save changes as you work
                          </p>
                        </div>
                        <Switch
                          id="autoSave"
                          checked={generalSettings.autoSave}
                          onCheckedChange={(checked) => 
                            handleToggleChange("autoSave", checked)
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="showEmptyProjects">Show Empty Projects</Label>
                          <p className="text-sm text-muted-foreground">
                            Display projects with no tasks
                          </p>
                        </div>
                        <Switch
                          id="showEmptyProjects"
                          checked={generalSettings.showEmptyProjects}
                          onCheckedChange={(checked) => 
                            handleToggleChange("showEmptyProjects", checked)
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="showCompletedTasks">Show Completed Tasks</Label>
                          <p className="text-sm text-muted-foreground">
                            Display completed tasks in task lists
                          </p>
                        </div>
                        <Switch
                          id="showCompletedTasks"
                          checked={generalSettings.showCompletedTasks}
                          onCheckedChange={(checked) => 
                            handleToggleChange("showCompletedTasks", checked)
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSaveGeneralSettings}>
                      Save Changes
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="database" className="animate-fade-in mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Database Configuration</CardTitle>
                    <CardDescription>
                      Configure your Postgres database connection
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="host">Host</Label>
                        <Input
                          id="host"
                          name="host"
                          value={databaseSettings.host}
                          onChange={handleDatabaseSettingsChange}
                          placeholder="localhost"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="port">Port</Label>
                        <Input
                          id="port"
                          name="port"
                          value={databaseSettings.port}
                          onChange={handleDatabaseSettingsChange}
                          placeholder="5432"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="database">Database Name</Label>
                      <Input
                        id="database"
                        name="database"
                        value={databaseSettings.database}
                        onChange={handleDatabaseSettingsChange}
                        placeholder="solo_quest"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="user">Username</Label>
                        <Input
                          id="user"
                          name="user"
                          value={databaseSettings.user}
                          onChange={handleDatabaseSettingsChange}
                          placeholder="postgres"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          value={databaseSettings.password}
                          onChange={handleDatabaseSettingsChange}
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-secondary/50 rounded-md p-4">
                      <div className="flex items-start">
                        <Shield className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium mb-1">Environment Variables</h4>
                          <p className="text-sm text-muted-foreground">
                            For production use, configure these values in your environment variables:
                          </p>
                          <div className="mt-2 bg-secondary p-3 rounded font-mono text-xs text-muted-foreground overflow-x-auto">
                            <div>DB_HOST=localhost</div>
                            <div>DB_PORT=5432</div>
                            <div>DB_NAME=solo_quest</div>
                            <div>DB_USER=postgres</div>
                            <div>DB_PASSWORD=your_password</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Terminal className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium mb-1">Schema Setup</h4>
                        <p className="text-sm text-muted-foreground">
                          Use the schema migration tool to initialize your database:
                        </p>
                        <div className="mt-2 bg-muted p-2 rounded font-mono text-xs overflow-x-auto">
                          npm run db:migrate
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSaveDatabaseSettings}>
                      Save Database Configuration
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="account" className="animate-fade-in mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">User Profile</CardTitle>
                    <CardDescription>
                      Manage your user profile
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col items-center py-4">
                      <div className="relative">
                        <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center text-4xl font-light text-muted-foreground">
                          S
                        </div>
                        <Button 
                          size="sm" 
                          className="absolute bottom-0 right-0 h-8 w-8 p-0 rounded-full"
                        >
                          <Palette className="h-4 w-4" />
                        </Button>
                      </div>
                      <h3 className="text-lg font-medium mt-4">Solo Developer</h3>
                      <p className="text-sm text-muted-foreground">Local Profile</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                          id="displayName"
                          placeholder="Solo Developer"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="developer@example.com"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-secondary/50 rounded-md p-4">
                      <div className="flex items-start">
                        <User className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium">Local Profile Mode</h4>
                          <p className="text-sm text-muted-foreground">
                            You're using local profile mode. Settings are stored locally.
                            Multi-user functionality will be available in a future update.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>
                      Save Profile
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications" className="animate-fade-in mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Notification Settings</CardTitle>
                    <CardDescription>
                      Configure how and when you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enableNotifications">Enable Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive system notifications
                        </p>
                      </div>
                      <Switch
                        id="enableNotifications"
                        checked={notificationSettings.enableNotifications}
                        onCheckedChange={(checked) => 
                          handleNotificationToggleChange("enableNotifications", checked)
                        }
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Notification Types</h3>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="taskReminders">Task Reminders</Label>
                          <p className="text-sm text-muted-foreground">
                            Reminders for upcoming and overdue tasks
                          </p>
                        </div>
                        <Switch
                          id="taskReminders"
                          checked={notificationSettings.taskReminders}
                          onCheckedChange={(checked) => 
                            handleNotificationToggleChange("taskReminders", checked)
                          }
                          disabled={!notificationSettings.enableNotifications}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="dueDateAlerts">Due Date Alerts</Label>
                          <p className="text-sm text-muted-foreground">
                            Notifications when task due dates are approaching
                          </p>
                        </div>
                        <Switch
                          id="dueDateAlerts"
                          checked={notificationSettings.dueDateAlerts}
                          onCheckedChange={(checked) => 
                            handleNotificationToggleChange("dueDateAlerts", checked)
                          }
                          disabled={!notificationSettings.enableNotifications}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-secondary/50 rounded-md p-4">
                      <div className="flex items-start">
                        <Bell className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium mb-1">Desktop Notifications</h4>
                          <p className="text-sm text-muted-foreground">
                            Desktop notifications require browser permissions. You may need to grant permission
                            when prompted by your browser.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSaveNotificationSettings}>
                      Save Notification Settings
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="appearance" className="animate-fade-in mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Appearance</CardTitle>
                    <CardDescription>
                      Customize the look and feel of the application
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Theme</h3>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div 
                          className={`border rounded-md p-3 cursor-pointer hover:border-primary transition-colors ${
                            generalSettings.theme === "light" ? "border-primary bg-secondary/50" : ""
                          }`}
                          onClick={() => handleToggleChange("theme", "light")}
                        >
                          <div className="h-20 bg-white border rounded-md mb-2"></div>
                          <div className="text-center text-sm font-medium">Light</div>
                        </div>
                        
                        <div 
                          className={`border rounded-md p-3 cursor-pointer hover:border-primary transition-colors ${
                            generalSettings.theme === "dark" ? "border-primary bg-secondary/50" : ""
                          }`}
                          onClick={() => handleToggleChange("theme", "dark")}
                        >
                          <div className="h-20 bg-gray-900 border border-gray-700 rounded-md mb-2"></div>
                          <div className="text-center text-sm font-medium">Dark</div>
                        </div>
                        
                        <div 
                          className={`border rounded-md p-3 cursor-pointer hover:border-primary transition-colors ${
                            generalSettings.theme === "system" ? "border-primary bg-secondary/50" : ""
                          }`}
                          onClick={() => handleToggleChange("theme", "system")}
                        >
                          <div className="h-20 bg-gradient-to-r from-white to-gray-900 border rounded-md mb-2"></div>
                          <div className="text-center text-sm font-medium">System</div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Font Size</h3>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="border rounded-md p-3 cursor-pointer hover:border-primary transition-colors">
                          <div className="flex flex-col items-center justify-center h-16">
                            <span className="text-sm">Aa</span>
                          </div>
                          <div className="text-center text-sm font-medium mt-2">Small</div>
                        </div>
                        
                        <div className="border rounded-md p-3 cursor-pointer hover:border-primary transition-colors border-primary bg-secondary/50">
                          <div className="flex flex-col items-center justify-center h-16">
                            <span className="text-base">Aa</span>
                          </div>
                          <div className="text-center text-sm font-medium mt-2">Medium</div>
                        </div>
                        
                        <div className="border rounded-md p-3 cursor-pointer hover:border-primary transition-colors">
                          <div className="flex flex-col items-center justify-center h-16">
                            <span className="text-lg">Aa</span>
                          </div>
                          <div className="text-center text-sm font-medium mt-2">Large</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSaveGeneralSettings}>
                      Save Appearance Settings
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="data" className="animate-fade-in mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Data Management</CardTitle>
                    <CardDescription>
                      Import and export your project data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="border rounded-md p-6">
                        <h3 className="text-lg font-medium mb-2">Export Data</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Export all your projects and tasks as JSON
                        </p>
                        <Button onClick={exportData}>
                          Export Data
                        </Button>
                      </div>
                      
                      <div className="border rounded-md p-6">
                        <h3 className="text-lg font-medium mb-2">Import Data</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Import projects and tasks from JSON
                        </p>
                        <Button variant="outline" onClick={importData}>
                          Import Data
                        </Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="bg-secondary/50 rounded-md p-4">
                      <div className="flex items-start">
                        <Shield className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium mb-1">Local Data Storage</h4>
                          <p className="text-sm text-muted-foreground">
                            Your data is stored locally in your self-hosted Postgres database.
                            Regular backups are recommended to prevent data loss.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border border-destructive/10 bg-destructive/5 rounded-md">
                      <h3 className="text-base font-medium text-destructive mb-2">Danger Zone</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        These actions are irreversible. Please proceed with caution.
                      </p>
                      <div className="space-y-3">
                        <Button variant="outline" className="border-destructive/30 hover:bg-destructive/10 text-destructive">
                          Clear Completed Tasks
                        </Button>
                        <Button variant="outline" className="border-destructive/30 hover:bg-destructive/10 text-destructive">
                          Reset All Data
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </main>
    </div>
  );
};

export default Settings;
