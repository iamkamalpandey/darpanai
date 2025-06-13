import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Settings, Users, FileText, Calendar, Shield, Bell, Database, Activity, Save, RotateCcw } from "lucide-react";

interface SystemStats {
  totalUsers: number;
  totalAnalyses: number;
  totalAppointments: number;
  activeUsers: number;
  pendingAppointments: number;
  completedAppointments: number;
}

interface SystemSettings {
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  maxAnalysesPerUser: number;
  systemAnnouncement: string;
  emailNotificationsEnabled: boolean;
  autoBackupEnabled: boolean;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    registrationEnabled: true,
    maxAnalysesPerUser: 3,
    systemAnnouncement: "",
    emailNotificationsEnabled: true,
    autoBackupEnabled: true,
  });
  const [hasChanges, setHasChanges] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch system statistics
  const { data: systemStats } = useQuery<SystemStats>({
    queryKey: ["/api/admin/system-stats"],
  });

  // Update system settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: SystemSettings) =>
      apiRequest("/api/admin/system-settings", "PATCH", newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/system-stats"] });
      toast({ title: "Success", description: "System settings updated successfully" });
      setHasChanges(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update system settings", variant: "destructive" });
    },
  });

  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateSettingsMutation.mutate(settings);
  };

  const handleReset = () => {
    setSettings({
      maintenanceMode: false,
      registrationEnabled: true,
      maxAnalysesPerUser: 3,
      systemAnnouncement: "",
      emailNotificationsEnabled: true,
      autoBackupEnabled: true,
    });
    setHasChanges(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
            <p className="text-gray-600">Configure system-wide settings and monitor performance</p>
          </div>
          <div className="flex space-x-2">
            {hasChanges && (
              <Button onClick={handleReset} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
            <Button 
              onClick={handleSave} 
              disabled={!hasChanges || updateSettingsMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* System Overview Cards */}
        {systemStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
                <p className="text-xs text-gray-600 mt-1">
                  {systemStats.activeUsers} active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
                <FileText className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.totalAnalyses}</div>
                <p className="text-xs text-gray-600 mt-1">Documents processed</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.totalAppointments}</div>
                <p className="text-xs text-gray-600 mt-1">
                  {systemStats.pendingAppointments} pending
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <Activity className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Operational</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">All systems running</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure basic system behavior and user defaults
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Registration Settings */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">User Registration</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Allow New Registrations</Label>
                        <p className="text-sm text-gray-600">
                          Enable or disable new user account creation
                        </p>
                      </div>
                      <Switch
                        checked={settings.registrationEnabled}
                        onCheckedChange={(checked) => handleSettingChange("registrationEnabled", checked)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="maxAnalyses" className="text-sm font-medium">
                          Default Analysis Limit
                        </Label>
                        <Input
                          id="maxAnalyses"
                          type="number"
                          min="1"
                          max="100"
                          value={settings.maxAnalysesPerUser}
                          onChange={(e) => handleSettingChange("maxAnalysesPerUser", parseInt(e.target.value))}
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          Default number of analyses per new user
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* System Announcement */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">System Announcement</h3>
                  <div className="space-y-2">
                    <Label htmlFor="announcement" className="text-sm font-medium">
                      Public Announcement
                    </Label>
                    <Textarea
                      id="announcement"
                      placeholder="Enter a system-wide announcement for all users..."
                      value={settings.systemAnnouncement}
                      onChange={(e) => handleSettingChange("systemAnnouncement", e.target.value)}
                      rows={3}
                    />
                    <p className="text-xs text-gray-600">
                      This message will be displayed to all users on the dashboard
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage system security and access controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Security Options */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Access Control</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Maintenance Mode</Label>
                        <p className="text-sm text-gray-600">
                          Restrict access to administrators only
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={settings.maintenanceMode}
                          onCheckedChange={(checked) => handleSettingChange("maintenanceMode", checked)}
                        />
                        <Badge variant={settings.maintenanceMode ? "destructive" : "secondary"}>
                          {settings.maintenanceMode ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Security Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Security Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-green-600" />
                          <CardTitle className="text-base">Authentication</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-600">
                          Session-based authentication with PostgreSQL storage
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2">
                          <Database className="h-4 w-4 text-blue-600" />
                          <CardTitle className="text-base">Data Protection</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-600">
                          Encrypted password storage and secure data handling
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure email notifications and alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Settings */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Email Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Enable Email Notifications</Label>
                        <p className="text-sm text-gray-600">
                          Send automated emails for account actions and updates
                        </p>
                      </div>
                      <Switch
                        checked={settings.emailNotificationsEnabled}
                        onCheckedChange={(checked) => handleSettingChange("emailNotificationsEnabled", checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Notification Types */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Notification Types</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2">
                          <Bell className="h-4 w-4 text-blue-600" />
                          <CardTitle className="text-base">User Notifications</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Welcome emails for new users</li>
                          <li>• Analysis completion notifications</li>
                          <li>• Appointment confirmations</li>
                        </ul>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2">
                          <Settings className="h-4 w-4 text-purple-600" />
                          <CardTitle className="text-base">Admin Notifications</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• New user registrations</li>
                          <li>• System error alerts</li>
                          <li>• Daily activity summaries</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance & Backup</CardTitle>
                <CardDescription>
                  System maintenance options and backup configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Backup Settings */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Backup Configuration</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Automatic Backups</Label>
                        <p className="text-sm text-gray-600">
                          Enable automated daily database backups
                        </p>
                      </div>
                      <Switch
                        checked={settings.autoBackupEnabled}
                        onCheckedChange={(checked) => handleSettingChange("autoBackupEnabled", checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* System Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">System Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Application Version</Label>
                      <p className="text-sm text-gray-600">v1.0.0</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Database Status</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Connected</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Last Backup</Label>
                      <p className="text-sm text-gray-600">Today, 12:00 AM</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Storage Usage</Label>
                      <p className="text-sm text-gray-600">2.3 GB / 10 GB</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Maintenance Actions */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Maintenance Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                      <Database className="h-3 w-3 mr-1" />
                      Create Backup
                    </Button>
                    <Button variant="outline" size="sm">
                      <Activity className="h-3 w-3 mr-1" />
                      System Health Check
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-3 w-3 mr-1" />
                      Clear Cache
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}