import { useState } from "react";
import { Calendar, MapPin, Clock, Search, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Booking = () => {
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");

  const availableSlots = [
    { id: 1, date: "Mon, Jan 15", time: "09:00 AM", provider: "Dr. Sarah Chen", location: "Main Clinic" },
    { id: 2, date: "Mon, Jan 15", time: "10:30 AM", provider: "Dr. Sarah Chen", location: "Main Clinic" },
    { id: 3, date: "Tue, Jan 16", time: "02:00 PM", provider: "Dr. John Smith", location: "East Wing" },
    { id: 4, date: "Wed, Jan 17", time: "11:00 AM", provider: "Dr. Sarah Chen", location: "Main Clinic" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">Book an Appointment</h1>
          <p className="text-sm text-muted-foreground">Find and schedule your next visit</p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Search Form */}
        <Card className="shadow-medium mb-8 animate-fade-in">
          <CardHeader>
            <CardTitle>Search for Available Appointments</CardTitle>
            <CardDescription>Filter by specialty, provider, or location</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger id="specialty">
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="general">General Medicine</SelectItem>
                    <SelectItem value="pediatrics">Pediatrics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger id="provider">
                    <SelectValue placeholder="Any provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chen">Dr. Sarah Chen</SelectItem>
                    <SelectItem value="smith">Dr. John Smith</SelectItem>
                    <SelectItem value="garcia">Dr. Maria Garcia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Enter location" />
              </div>
            </div>

            <Button className="mt-6 w-full md:w-auto bg-primary hover:bg-primary/90">
              <Search className="mr-2 h-4 w-4" />
              Search Available Slots
            </Button>
          </CardContent>
        </Card>

        {/* Available Slots */}
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-xl font-semibold text-foreground mb-4">Available Time Slots</h2>
          {availableSlots.map((slot, index) => (
            <Card 
              key={slot.id} 
              className="shadow-soft hover:shadow-medium transition-all cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-4 min-w-[100px]">
                      <Calendar className="h-5 w-5 text-primary mb-1" />
                      <p className="text-sm font-semibold text-foreground">{slot.date}</p>
                      <p className="text-lg font-bold text-primary">{slot.time}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="font-semibold text-foreground text-lg">{slot.provider}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{slot.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>30 min</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button className="bg-accent hover:bg-accent/90">
                    Book Now
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Waitlist Option */}
        <Card className="mt-8 shadow-medium bg-secondary/20 border-secondary animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Don't see a suitable time?</h3>
                <p className="text-sm text-muted-foreground">
                  Join our waitlist and we'll notify you when earlier slots become available
                </p>
              </div>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Join Waitlist
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Booking;
