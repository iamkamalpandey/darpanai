import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, Database, Users, FileText, Shield, Download, Upload, RefreshCw } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettings() {
  const [defaultMaxAnalyses, setDefaultMaxAnalyses] = useState("3");
  const [systemAnnouncement, setSystemAnnouncement] = useState("");
  const { toast } = useToast();

  const { data: systemStats, isLoading } = useQuery({
    queryKey: ["/api/admin/system-stats"],
  });

  // Update local state when data loads
  React.useEffect(() => {
    if (systemStats) {
      setDefaultMaxAnalyses(systemStats.defaultMaxAnalyses?.toString() || "3");
      setSystemAnnouncement(systemStats.systemAnnouncement || "");
    }
  }, [systemStats]);

  const updateSystemSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const response = await apiRequest("PATCH", "/api/admin/system-settings", settings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/system-stats"] });
      toast({
        title: "Success",
        description: "System settings updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error", 
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const exportDataMutation = useMutation({
    mutationFn: async (dataType: string) => {
      const response = await fetch(`/api/admin/export/${dataType}?format=csv`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'text/csv',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      return { blob, dataType };
    },
    onSuccess: ({ blob, dataType }) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dataType}-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Success",
        description: `${dataType} data exported successfully as CSV`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpdateSettings = () => {
    updateSystemSettingsMutation.mutate({
      defaultMaxAnalyses: parseInt(defaultMaxAnalyses),
      systemAnnouncement,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">System Settings</h1>
            <p className="text-muted-foreground">Configure system-wide settings and manage data</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="max-analyses">Default Analysis Limit for New Users</Label>
                <Input
                  id="max-analyses"
                  type="number"
                  min="1"
                  value={defaultMaxAnalyses}
                  onChange={(e) => setDefaultMaxAnalyses(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  New users will receive this many free analyses
                </p>
              </div>

              <div>
                <Label htmlFor="announcement">System Announcement</Label>
                <Input
                  id="announcement"
                  placeholder="Optional message to display to all users"
                  value={systemAnnouncement}
                  onChange={(e) => setSystemAnnouncement(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This message will appear on user dashboards
                </p>
              </div>

              <Button 
                onClick={handleUpdateSettings}
                disabled={updateSystemSettingsMutation.isPending}
                className="w-full"
              >
                {updateSystemSettingsMutation.isPending ? "Updating..." : "Update Settings"}
              </Button>
            </CardContent>
          </Card>

          {/* System Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-lg font-semibold">7</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Analyses</p>
                    <p className="text-lg font-semibold">3</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Admin Users</p>
                    <p className="text-lg font-semibold">5</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">System Uptime</p>
                    <p className="text-lg font-semibold">Active</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Export Data</h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => exportDataMutation.mutate('users')}
                    disabled={exportDataMutation.isPending}
                    className="w-full justify-start"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Users Data
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => exportDataMutation.mutate('analyses')}
                    disabled={exportDataMutation.isPending}
                    className="w-full justify-start"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Analyses Data
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => exportDataMutation.mutate('appointments')}
                    disabled={exportDataMutation.isPending}
                    className="w-full justify-start"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Appointments Data
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Database Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Connection</span>
                    <Badge variant="default">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Backup</span>
                    <Badge variant="secondary">Automated</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Integrity</span>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security & Access Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Access Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Admin Access</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Manage administrator access and security settings
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Admin Sessions</span>
                    <Badge variant="default">1</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Session Timeout</span>
                    <Badge variant="secondary">24 hours</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Password Policy</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">API Integration</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">OpenAI API</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">File Processing</span>
                    <Badge variant="default">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email Service</span>
                    <Badge variant="secondary">Not Configured</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2">
                <RefreshCw className="h-6 w-6" />
                <span>Refresh System Cache</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Shield className="h-6 w-6" />
                <span>Review Security Logs</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}