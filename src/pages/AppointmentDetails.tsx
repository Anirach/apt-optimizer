import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  ChevronLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  AlertCircle,
  CheckCircle,
  MessageSquare,
  FileText,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AppointmentDetails = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientName = searchParams.get("patient") || "Unknown Patient";

  // Mock data - in real app, this would be fetched based on appointment ID
  const appointment = {
    id: "APT-2024-0123",
    patient: {
      name: patientName,
      age: 42,
      gender: "Female",
      phone: "+66 81 234 5678",
      email: "sarah.chen@email.com",
      address: "123 Sukhumvit Rd, Bangkok 10110"
    },
    appointment: {
      date: "Jan 15, 2024",
      time: "09:00 AM",
      duration: "30 minutes",
      type: "Orthopedics",
      provider: "Dr. Somsak Tanaka",
      location: "Building A, 3rd Floor, Room 305",
      status: "Confirmed"
    },
    risk: {
      level: "low",
      score: 0.23,
      factors: [
        { factor: "Historical attendance rate", value: "95% (20/21 appointments)" },
        { factor: "Appointment lead time", value: "7 days (Optimal)" },
        { factor: "Confirmation status", value: "Confirmed via SMS" },
        { factor: "Time of day", value: "Morning slot (preferred)" }
      ]
    },
    communications: [
      { id: 1, date: "Jan 12, 2024 10:30 AM", channel: "SMS", message: "Appointment reminder sent", status: "Delivered" },
      { id: 2, date: "Jan 12, 2024 11:45 AM", channel: "SMS", message: "Patient confirmed attendance", status: "Confirmed" },
      { id: 3, date: "Jan 8, 2024 02:15 PM", channel: "Email", message: "Appointment confirmation sent", status: "Opened" }
    ],
    history: [
      { id: 1, date: "Dec 10, 2023", type: "Orthopedics", status: "Attended" },
      { id: 2, date: "Nov 5, 2023", type: "General", status: "Attended" },
      { id: 3, date: "Sep 22, 2023", type: "Orthopedics", status: "Attended" }
    ]
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high": return "destructive";
      case "medium": return "default";
      default: return "secondary";
    }
  };

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case "high": return "bg-destructive/10 border-destructive/20";
      case "medium": return "bg-accent/10 border-accent/20";
      default: return "bg-primary/10 border-primary/20";
    }
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
                <h1 className="text-2xl font-bold text-foreground">Appointment Details</h1>
                <p className="text-sm text-muted-foreground">{appointment.id}</p>
              </div>
            </div>
            <Badge variant={appointment.appointment.status === "Confirmed" ? "default" : "secondary"}>
              {appointment.appointment.status}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Risk Assessment */}
            <Card className={`shadow-medium border-2 ${getRiskBgColor(appointment.risk.level)}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className={`h-6 w-6 ${
                      appointment.risk.level === "high" ? "text-destructive" :
                      appointment.risk.level === "medium" ? "text-accent" :
                      "text-primary"
                    }`} />
                    <div>
                      <CardTitle>No-Show Risk Assessment</CardTitle>
                      <CardDescription>AI-powered prediction</CardDescription>
                    </div>
                  </div>
                  <Badge variant={getRiskColor(appointment.risk.level)} className="text-sm">
                    {appointment.risk.level.toUpperCase()} RISK
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Predicted show probability</span>
                    <span className="text-lg font-bold text-foreground">
                      {Math.round((1 - appointment.risk.score) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        appointment.risk.level === "high" ? "bg-destructive" :
                        appointment.risk.level === "medium" ? "bg-accent" :
                        "bg-primary"
                      }`}
                      style={{ width: `${(1 - appointment.risk.score) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">Contributing Factors</h4>
                  {appointment.risk.factors.map((factor, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{factor.factor}</span>
                      <span className="font-medium text-foreground">{factor.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tabs for Communications and History */}
            <Tabs defaultValue="communications" className="space-y-4">
              <TabsList className="bg-muted">
                <TabsTrigger value="communications">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Communications
                </TabsTrigger>
                <TabsTrigger value="history">
                  <Activity className="h-4 w-4 mr-2" />
                  Visit History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="communications" className="animate-fade-in">
                <Card className="shadow-medium">
                  <CardHeader>
                    <CardTitle>Communication Timeline</CardTitle>
                    <CardDescription>All interactions with the patient</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {appointment.communications.map((comm) => (
                        <div key={comm.id} className="flex gap-4">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <MessageSquare className="h-5 w-5 text-primary" />
                            </div>
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-foreground">{comm.message}</p>
                              <Badge variant="outline" className="text-xs">
                                {comm.channel}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-muted-foreground">{comm.date}</p>
                              <span className="text-xs text-muted-foreground">•</span>
                              <p className="text-xs text-primary">{comm.status}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="animate-fade-in">
                <Card className="shadow-medium">
                  <CardHeader>
                    <CardTitle>Visit History</CardTitle>
                    <CardDescription>Past appointments and attendance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {appointment.history.map((visit) => (
                        <div key={visit.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <CheckCircle className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{visit.type}</p>
                              <p className="text-sm text-muted-foreground">{visit.date}</p>
                            </div>
                          </div>
                          <Badge variant="secondary">{visit.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Patient Information */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-foreground">{appointment.patient.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {appointment.patient.age} years old • {appointment.patient.gender}
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm text-foreground">{appointment.patient.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm text-foreground">{appointment.patient.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="text-sm text-foreground">{appointment.patient.address}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appointment Details */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Appointment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Date</span>
                  <span className="text-sm font-medium text-foreground">{appointment.appointment.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Time</span>
                  <span className="text-sm font-medium text-foreground">{appointment.appointment.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="text-sm font-medium text-foreground">{appointment.appointment.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <span className="text-sm font-medium text-foreground">{appointment.appointment.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Provider</span>
                  <span className="text-sm font-medium text-foreground">{appointment.appointment.provider}</span>
                </div>
                <Separator />
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm text-foreground">{appointment.appointment.location}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="default">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Appointment
                </Button>
                <Button className="w-full" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Reschedule
                </Button>
                <Button className="w-full" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Reminder
                </Button>
                <Separator />
                <Button className="w-full" variant="destructive">
                  Cancel Appointment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppointmentDetails;
