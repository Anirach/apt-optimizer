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
  Activity,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const WaitlistDetails = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientName = searchParams.get("patient") || "Unknown Patient";

  // Mock data
  const waitlistEntry = {
    id: "WL-2024-0045",
    patient: {
      name: patientName,
      age: 58,
      gender: "Male",
      phone: "+66 82 345 6789",
      email: "tom.anderson@email.com",
      memberSince: "2021"
    },
    request: {
      type: "Cardiology",
      preferredProvider: "Dr. Somsak Tanaka",
      requestDate: "Jan 4, 2024",
      waitDays: 12,
      priority: "High",
      urgency: "Moderate",
      flexibility: "Willing to see any cardiologist, prefers morning slots"
    },
    availability: {
      days: ["Monday", "Tuesday", "Wednesday", "Friday"],
      times: ["Morning (8AM-12PM)", "Early Afternoon (1PM-3PM)"],
      locations: ["Building A", "Building B"]
    },
    matchingSlots: [
      { date: "Jan 22, 2024", time: "09:30 AM", provider: "Dr. Somsak Tanaka", location: "Building A, Room 305" },
      { date: "Jan 23, 2024", time: "10:00 AM", provider: "Dr. Preecha Kim", location: "Building B, Room 201" },
      { date: "Jan 25, 2024", time: "08:30 AM", provider: "Dr. Somsak Tanaka", location: "Building A, Room 305" }
    ],
    history: [
      { id: 1, date: "Dec 15, 2023", type: "Cardiology", status: "Attended" },
      { id: 2, date: "Oct 8, 2023", type: "General", status: "Attended" },
      { id: 3, date: "Aug 20, 2023", type: "Cardiology", status: "Attended" }
    ],
    communications: [
      { id: 1, date: "Jan 12, 2024 03:20 PM", channel: "SMS", message: "Waitlist position update sent", status: "Delivered" },
      { id: 2, date: "Jan 10, 2024 09:15 AM", channel: "Email", message: "Availability preferences confirmed", status: "Opened" },
      { id: 3, date: "Jan 4, 2024 02:30 PM", channel: "SMS", message: "Waitlist registration confirmation", status: "Delivered" }
    ]
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "destructive";
      case "Medium": return "default";
      default: return "secondary";
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case "High": return "bg-destructive/10 border-destructive/20";
      case "Medium": return "bg-accent/10 border-accent/20";
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
                <h1 className="text-2xl font-bold text-foreground">Waitlist Details</h1>
                <p className="text-sm text-muted-foreground">{waitlistEntry.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={getPriorityColor(waitlistEntry.request.priority)}>
                {waitlistEntry.request.priority} Priority
              </Badge>
              <Badge variant="outline">
                Waiting {waitlistEntry.request.waitDays} days
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Waitlist Status */}
            <Card className={`shadow-medium border-2 ${getPriorityBg(waitlistEntry.request.priority)}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-6 w-6 text-accent" />
                    <div>
                      <CardTitle>Waitlist Position & Status</CardTitle>
                      <CardDescription>Current placement and estimated wait time</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 rounded-lg bg-background">
                    <p className="text-3xl font-bold text-foreground">3</p>
                    <p className="text-xs text-muted-foreground mt-1">Position in Queue</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-background">
                    <p className="text-3xl font-bold text-foreground">5-7</p>
                    <p className="text-xs text-muted-foreground mt-1">Est. Days to Match</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-background">
                    <p className="text-3xl font-bold text-foreground">3</p>
                    <p className="text-xs text-muted-foreground mt-1">Available Slots</p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Request Date</span>
                    <span className="text-sm font-medium text-foreground">{waitlistEntry.request.requestDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Medical Urgency</span>
                    <span className="text-sm font-medium text-foreground">{waitlistEntry.request.urgency}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-muted-foreground">Patient Flexibility</span>
                    <span className="text-sm font-medium text-foreground text-right max-w-[60%]">
                      {waitlistEntry.request.flexibility}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Matching Slots */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Available Matching Slots</CardTitle>
                <CardDescription>Slots that match patient preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {waitlistEntry.matchingSlots.map((slot, index) => (
                    <div key={index} className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{slot.date} at {slot.time}</p>
                            <p className="text-sm text-muted-foreground">{slot.provider}</p>
                            <p className="text-xs text-muted-foreground">{slot.location}</p>
                          </div>
                        </div>
                        <Button variant="default" size="sm">
                          Assign Slot
                        </Button>
                      </div>
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
                    <CardDescription>All waitlist-related communications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {waitlistEntry.communications.map((comm) => (
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
                      {waitlistEntry.history.map((visit) => (
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
                  <p className="text-2xl font-bold text-foreground">{waitlistEntry.patient.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {waitlistEntry.patient.age} years old • {waitlistEntry.patient.gender}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Patient since {waitlistEntry.patient.memberSince}
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm text-foreground">{waitlistEntry.patient.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm text-foreground">{waitlistEntry.patient.email}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Request Details */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Request Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <span className="text-sm font-medium text-foreground">{waitlistEntry.request.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Preferred Provider</span>
                  <span className="text-sm font-medium text-foreground">{waitlistEntry.request.preferredProvider}</span>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Available Days</p>
                  <div className="flex flex-wrap gap-2">
                    {waitlistEntry.availability.days.map((day) => (
                      <Badge key={day} variant="secondary" className="text-xs">
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Preferred Times</p>
                  <div className="flex flex-wrap gap-2">
                    {waitlistEntry.availability.times.map((time) => (
                      <Badge key={time} variant="secondary" className="text-xs">
                        {time}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Locations</p>
                  <div className="flex flex-wrap gap-2">
                    {waitlistEntry.availability.locations.map((loc) => (
                      <Badge key={loc} variant="secondary" className="text-xs">
                        {loc}
                      </Badge>
                    ))}
                  </div>
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
                  <Calendar className="h-4 w-4 mr-2" />
                  Manual Slot Assignment
                </Button>
                <Button className="w-full" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Patient
                </Button>
                <Button className="w-full" variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  Update Preferences
                </Button>
                <Separator />
                <Button className="w-full" variant="destructive">
                  Remove from Waitlist
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WaitlistDetails;
