import { useState } from "react";
import { Calendar, Clock, Users, TrendingDown, Activity, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState("week");

  // Mock data for KPIs
  const kpis = [
    {
      title: "No-Show Rate",
      value: "12.3%",
      change: "-23%",
      trend: "down",
      icon: TrendingDown,
      color: "text-primary"
    },
    {
      title: "Avg. Wait Time",
      value: "4.2 days",
      change: "-35%",
      trend: "down",
      icon: Clock,
      color: "text-primary"
    },
    {
      title: "Provider Utilization",
      value: "87%",
      change: "+18%",
      trend: "up",
      icon: Activity,
      color: "text-accent"
    },
    {
      title: "Active Patients",
      value: "1,247",
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "text-accent"
    }
  ];

  const upcomingAppointments = [
    { id: 1, patient: "Sarah Chen", time: "09:00 AM", type: "Orthopedics", risk: "low" },
    { id: 2, patient: "John Smith", time: "10:30 AM", type: "Cardiology", risk: "medium" },
    { id: 3, patient: "Maria Garcia", time: "02:00 PM", type: "General", risk: "low" },
    { id: 4, patient: "David Park", time: "03:30 PM", type: "Orthopedics", risk: "high" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Staff Dashboard</h1>
              <p className="text-sm text-muted-foreground">Monitor appointments and analytics</p>
            </div>
            <Button variant="default" className="bg-primary hover:bg-primary/90">
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
                  {kpi.change} from last {timeRange}
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
                  {upcomingAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{apt.patient}</p>
                          <p className="text-sm text-muted-foreground">{apt.type}</p>
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
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
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
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No patients on waitlist</p>
                </div>
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
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Advanced analytics coming soon</p>
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
