import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  ChevronLeft, 
  TrendingDown, 
  TrendingUp, 
  Calendar, 
  Clock,
  Users,
  Activity,
  AlertCircle,
  BarChart3,
  PieChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AnalyticsDetails = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const department = searchParams.get("dept") || "All Departments";

  // Mock analytics data
  const analyticsData = {
    department: department,
    period: "Last 30 Days",
    overview: {
      totalAppointments: department === "Cardiology" ? 342 : department === "Orthopedics" ? 298 : 607,
      utilization: department === "Cardiology" ? 92 : department === "Orthopedics" ? 88 : 82,
      noShowRate: department === "Cardiology" ? 8 : department === "Orthopedics" ? 12 : 15,
      avgWaitTime: department === "Cardiology" ? 3.2 : department === "Orthopedics" ? 4.8 : 5.1
    },
    trends: {
      appointmentsChange: "+8%",
      utilizationChange: "+5%",
      noShowChange: "-12%",
      waitTimeChange: "-15%"
    },
    timeSlotPerformance: [
      { slot: "8:00-10:00 AM", bookings: 89, utilization: 95, noShows: 5 },
      { slot: "10:00-12:00 PM", bookings: 86, utilization: 91, noShows: 7 },
      { slot: "12:00-2:00 PM", bookings: 52, utilization: 68, noShows: 12 },
      { slot: "2:00-4:00 PM", bookings: 71, utilization: 84, noShows: 8 },
      { slot: "4:00-6:00 PM", bookings: 44, utilization: 71, noShows: 15 }
    ],
    providerPerformance: [
      { name: "Dr. Somsak Tanaka", appointments: 142, utilization: 94, noShowRate: 6 },
      { name: "Dr. Preecha Kim", appointments: 128, utilization: 89, noShowRate: 9 },
      { name: "Dr. Anong Lee", appointments: 98, utilization: 86, noShowRate: 11 }
    ],
    topIssues: [
      { issue: "High no-show rate in afternoon slots", severity: "High", impact: "15% of afternoon slots" },
      { issue: "Low utilization on Fridays", severity: "Medium", impact: "72% vs 87% average" },
      { issue: "Long wait times for new patients", severity: "Medium", impact: "6.2 days average" }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-soft sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="hover:bg-muted"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Analytics Details</h1>
                <p className="text-sm text-muted-foreground">{analyticsData.department} • {analyticsData.period}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Change Period
              </Button>
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* KPI Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8 animate-fade-in">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Appointments
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{analyticsData.overview.totalAppointments}</div>
              <p className="text-xs text-primary flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                {analyticsData.trends.appointmentsChange} from last period
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Utilization Rate
              </CardTitle>
              <Activity className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{analyticsData.overview.utilization}%</div>
              <p className="text-xs text-accent flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                {analyticsData.trends.utilizationChange} from last period
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                No-Show Rate
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{analyticsData.overview.noShowRate}%</div>
              <p className="text-xs text-primary flex items-center gap-1 mt-1">
                <TrendingDown className="h-3 w-3" />
                {analyticsData.trends.noShowChange} from last period
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Wait Time
              </CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{analyticsData.overview.avgWaitTime} days</div>
              <p className="text-xs text-primary flex items-center gap-1 mt-1">
                <TrendingDown className="h-3 w-3" />
                {analyticsData.trends.waitTimeChange} from last period
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Time Slot Performance */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Time Slot Performance</CardTitle>
              <CardDescription>Booking patterns throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.timeSlotPerformance.map((slot) => (
                  <div key={slot.slot}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{slot.slot}</p>
                        <p className="text-xs text-muted-foreground">
                          {slot.bookings} bookings • {slot.noShows} no-shows
                        </p>
                      </div>
                      <Badge variant={slot.utilization >= 85 ? "default" : "secondary"}>
                        {slot.utilization}%
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          slot.utilization >= 85 ? "bg-primary" : "bg-muted-foreground"
                        }`}
                        style={{ width: `${slot.utilization}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Provider Performance */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Provider Performance</CardTitle>
              <CardDescription>Individual provider metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.providerPerformance.map((provider) => (
                  <div key={provider.name} className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-foreground">{provider.name}</p>
                      <Badge variant={provider.utilization >= 90 ? "default" : "secondary"}>
                        {provider.utilization}% utilization
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Appointments</p>
                        <p className="font-semibold text-foreground">{provider.appointments}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">No-Show Rate</p>
                        <p className={`font-semibold ${
                          provider.noShowRate <= 8 ? "text-primary" : "text-destructive"
                        }`}>
                          {provider.noShowRate}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Issues & Recommendations */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Issues & Recommendations</CardTitle>
            <CardDescription>AI-identified optimization opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topIssues.map((issue, index) => (
                <div key={index} className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      <AlertCircle className={`h-5 w-5 mt-0.5 ${
                        issue.severity === "High" ? "text-destructive" : "text-accent"
                      }`} />
                      <div>
                        <p className="font-medium text-foreground">{issue.issue}</p>
                        <p className="text-sm text-muted-foreground mt-1">{issue.impact}</p>
                      </div>
                    </div>
                    <Badge variant={issue.severity === "High" ? "destructive" : "default"}>
                      {issue.severity}
                    </Badge>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="default">
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      Generate Action Plan
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AnalyticsDetails;
