import { Calendar, Clock, Users, TrendingDown, Activity, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useDashboardAnalytics } from "@/hooks/useAnalytics";
import { useWaitlist } from "@/hooks/useWaitlist";
import type { NoShowRisk } from "@/types";

const Dashboard = () => {
  const navigate = useNavigate();

  // Fetch dashboard analytics
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useDashboardAnalytics();

  // Fetch active waitlist
  const { data: waitlistData, isLoading: waitlistLoading, error: waitlistError } = useWaitlist({
    status: 'active',
    page: 1,
    pageSize: 10,
  });

  // Transform KPI data from analytics
  const kpis = analytics ? [
    {
      title: "No-Show Rate",
      value: `${analytics.kpis.noShowRate}%`,
      change: `${analytics.kpis.noShowRateChange}%`,
      trend: analytics.kpis.noShowRateChange < 0 ? "down" : "up" as const,
      icon: TrendingDown,
      color: "text-primary"
    },
    {
      title: "Avg. Wait Time",
      value: `${analytics.kpis.averageWaitTime} days`,
      change: `${analytics.kpis.averageWaitTimeChange}%`,
      trend: analytics.kpis.averageWaitTimeChange < 0 ? "down" : "up" as const,
      icon: Clock,
      color: "text-primary"
    },
    {
      title: "Provider Utilization",
      value: `${analytics.kpis.utilization}%`,
      change: `+${analytics.kpis.utilizationChange}%`,
      trend: "up" as const,
      icon: Activity,
      color: "text-accent"
    },
    {
      title: "Active Patients",
      value: analytics.kpis.activePatients.toLocaleString(),
      change: `+${analytics.kpis.activePatientsChange}%`,
      trend: "up" as const,
      icon: Users,
      color: "text-accent"
    }
  ] : [];

  const upcomingAppointments = analytics?.upcomingAppointments || [];

  // Show loading state
  if (analyticsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (analyticsError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Dashboard</CardTitle>
            <CardDescription>Unable to fetch dashboard data</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {analyticsError instanceof Error ? analyticsError.message : 'An unexpected error occurred'}
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Staff Dashboard</h1>
              <p className="text-sm text-muted-foreground">Monitor appointments and analytics</p>
            </div>
            <Button
              variant="default"
              className="bg-primary hover:bg-primary/90"
              onClick={() => navigate("/calendar")}
            >
              <Calendar className="mr-2 h-4 w-4" />
              View Full Calendar
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* KPI Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8 animate-fade-in">
          {kpis.map((kpi, index) => (
            <Card key={index} className="shadow-soft hover:shadow-medium transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
                <p className={`text-xs ${kpi.trend === 'down' ? 'text-primary' : 'text-accent'}`}>
                  {kpi.change} from last week
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="appointments">Today's Appointments</TabsTrigger>
            <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-4 animate-fade-in">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Today's schedule with risk indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingAppointments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No appointments scheduled for today</p>
                    </div>
                  ) : (
                    upcomingAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{apt.patientName}</p>
                            <p className="text-sm text-muted-foreground">{apt.department}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium text-foreground">{apt.time}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <AlertCircle className={`h-3 w-3 ${
                                apt.risk === 'high' ? 'text-destructive' :
                                apt.risk === 'medium' ? 'text-accent' :
                                'text-primary'
                              }`} />
                              <span className={`text-xs ${
                                apt.risk === 'high' ? 'text-destructive' :
                                apt.risk === 'medium' ? 'text-accent' :
                                'text-primary'
                              }`}>
                                {apt.risk} risk
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/appointment/${apt.id}?patient=${encodeURIComponent(apt.patientName)}`)}
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="waitlist" className="animate-fade-in">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Waitlist Management</CardTitle>
                <CardDescription>Patients waiting for available slots</CardDescription>
              </CardHeader>
              <CardContent>
                {waitlistLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : waitlistError ? (
                  <div className="text-center py-8 text-destructive">
                    <p>Error loading waitlist</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!waitlistData?.data || waitlistData.data.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No patients on waitlist</p>
                      </div>
                    ) : (
                      waitlistData.data.map((entry) => {
                        const patientName = entry.patient
                          ? `${entry.patient.firstName} ${entry.patient.lastName}`
                          : 'Unknown Patient';
                        const departmentName = entry.department?.name || 'Unknown Department';
                        const waitDays = Math.floor(
                          (new Date().getTime() - new Date(entry.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                        );

                        return (
                          <div
                            key={entry.id}
                            className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                                <Users className="h-6 w-6 text-accent" />
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">{patientName}</p>
                                <p className="text-sm text-muted-foreground">{departmentName}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-medium text-foreground">Waiting {waitDays} days</p>
                                <div className="flex items-center gap-1 mt-1">
                                  <AlertCircle className={`h-3 w-3 ${
                                    entry.priority === 'high' || entry.priority === 'urgent' ? 'text-destructive' :
                                    entry.priority === 'medium' ? 'text-accent' :
                                    'text-primary'
                                  }`} />
                                  <span className={`text-xs capitalize ${
                                    entry.priority === 'high' || entry.priority === 'urgent' ? 'text-destructive' :
                                    entry.priority === 'medium' ? 'text-accent' :
                                    'text-primary'
                                  }`}>
                                    {entry.priority} priority
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/waitlist/${entry.id}?patient=${encodeURIComponent(patientName)}`)}
                              >
                                Details
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="animate-fade-in">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>Detailed metrics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-sm text-muted-foreground">Total Appointments</p>
                      <p className="text-2xl font-bold text-foreground mt-1">1,247</p>
                      <p className="text-xs text-primary mt-1">+8% from last week</p>
                    </div>
                    <div className="p-4 rounded-lg bg-accent/5 border border-accent/10">
                      <p className="text-sm text-muted-foreground">Avg. Utilization</p>
                      <p className="text-2xl font-bold text-foreground mt-1">87%</p>
                      <p className="text-xs text-accent mt-1">+5% from last week</p>
                    </div>
                    <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/10">
                      <p className="text-sm text-muted-foreground">No-Shows</p>
                      <p className="text-2xl font-bold text-foreground mt-1">154</p>
                      <p className="text-xs text-destructive mt-1">-12% from last week</p>
                    </div>
                  </div>

                  {/* Department Performance */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">Department Performance</h3>
                    <div className="space-y-3">
                      {[
                        { dept: "Cardiology", appointments: 342, utilization: 92, noShow: 8 },
                        { dept: "Orthopedics", appointments: 298, utilization: 88, noShow: 12 },
                        { dept: "General", appointments: 607, utilization: 82, noShow: 15 },
                      ].map((dept) => (
                        <div key={dept.dept} className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-foreground">{dept.dept}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {dept.appointments} appointments • {dept.utilization}% utilization
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(`/analytics?dept=${dept.dept}`)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
