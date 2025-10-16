import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const Calendar = () => {
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState(0);

  const timeSlots = Array.from({ length: 20 }, (_, i) => {
    const hour = 8 + Math.floor(i / 2);
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  
  // Mock appointments data
  const appointments = {
    0: { // Monday
      "09:00": { patient: "Sarah Chen", type: "Orthopedics", duration: 1, risk: "low" },
      "10:30": { patient: "John Smith", type: "Cardiology", duration: 1, risk: "medium" },
      "14:00": { patient: "Maria Garcia", type: "General", duration: 1, risk: "low" },
    },
    1: { // Tuesday
      "09:30": { patient: "David Park", type: "Orthopedics", duration: 2, risk: "high" },
      "13:00": { patient: "Emma Wilson", type: "Cardiology", duration: 1, risk: "low" },
    },
    2: { // Wednesday
      "10:00": { patient: "James Lee", type: "General", duration: 1, risk: "medium" },
      "15:30": { patient: "Sofia Rodriguez", type: "Orthopedics", duration: 1, risk: "low" },
    },
    3: { // Thursday
      "08:30": { patient: "Michael Brown", type: "Cardiology", duration: 1, risk: "low" },
      "11:00": { patient: "Lisa Anderson", type: "General", duration: 2, risk: "high" },
    },
    4: { // Friday
      "09:00": { patient: "Robert Taylor", type: "Orthopedics", duration: 1, risk: "medium" },
      "14:30": { patient: "Anna White", type: "Cardiology", duration: 1, risk: "low" },
    },
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high": return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium": return "bg-accent/10 text-accent border-accent/20";
      default: return "bg-primary/10 text-primary border-primary/20";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-soft sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate("/dashboard")}
                  className="hover:bg-muted"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Full Calendar View</h1>
                  <p className="text-sm text-muted-foreground">Week of Jan 15-19, 2024</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(currentWeek - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(currentWeek + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6">
        <Card className="shadow-medium overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-[80px_repeat(5,1fr)] border-b bg-muted/30">
              <div className="p-3 border-r bg-card"></div>
              {weekDays.map((day, index) => (
                <div key={day} className="p-3 border-r last:border-r-0">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground font-medium">{day}</div>
                    <div className="text-lg font-bold text-foreground mt-1">
                      {15 + index}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="overflow-auto max-h-[calc(100vh-240px)]">
              {timeSlots.map((time, timeIndex) => (
                <div
                  key={time}
                  className="grid grid-cols-[80px_repeat(5,1fr)] border-b last:border-b-0 hover:bg-muted/20 transition-colors"
                >
                  <div className="p-3 border-r bg-card text-xs text-muted-foreground font-medium sticky left-0 z-10">
                    {time}
                  </div>
                  {weekDays.map((_, dayIndex) => {
                    const appointment = appointments[dayIndex as keyof typeof appointments]?.[time];
                    return (
                      <div
                        key={dayIndex}
                        className="p-2 border-r last:border-r-0 min-h-[60px] relative"
                      >
                        {appointment && (
                          <div
                            className={`p-2 rounded-lg border text-xs ${getRiskColor(appointment.risk)} cursor-pointer hover:shadow-soft transition-all h-full`}
                            style={{
                              gridRow: `span ${appointment.duration}`,
                            }}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <div className="font-semibold truncate flex-1">
                                {appointment.patient}
                              </div>
                              <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0">
                                {appointment.risk}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] opacity-80">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{appointment.type}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] opacity-80 mt-0.5">
                              <Clock className="h-3 w-3" />
                              <span>{time}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-primary/10 border border-primary/20"></div>
            <span className="text-xs text-muted-foreground">Low Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-accent/10 border border-accent/20"></div>
            <span className="text-xs text-muted-foreground">Medium Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-destructive/10 border border-destructive/20"></div>
            <span className="text-xs text-muted-foreground">High Risk</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Calendar;
