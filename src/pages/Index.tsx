import { Link } from "react-router-dom";
import { Calendar, TrendingDown, Clock, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const features = [
    {
      icon: TrendingDown,
      title: "Reduce No-Shows by 35%",
      description: "AI-powered predictions and smart reminders ensure patients keep their appointments"
    },
    {
      icon: Clock,
      title: "Faster Appointment Access",
      description: "Reduce wait times by 40% with intelligent scheduling and capacity optimization"
    },
    {
      icon: Users,
      title: "Maximize Provider Time",
      description: "Increase utilization by 25% through smart overbooking and waitlist management"
    },
    {
      icon: Calendar,
      title: "Seamless Booking",
      description: "Multi-channel scheduling via web, mobile, chatbot, and contact center"
    }
  ];

  const benefits = [
    "Smart waitlist management with automated backfill",
    "Real-time schedule optimization",
    "Multi-channel reminders (SMS, Email, LINE)",
    "Comprehensive analytics dashboard",
    "PDPA compliant and secure",
    "Seamless EHR/HIS integration"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0aDR2NGgtNHptMCAyMGg0djRoLTR6bS0yMCAwaDR2NGgtNHptMC0yMGg0djRoLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="container relative mx-auto px-6 py-20 md:py-32">
          <div className="max-w-3xl animate-fade-in">
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              Transform Patient Access with Intelligent Scheduling
            </h1>
            <p className="mb-8 text-lg md:text-xl text-primary-foreground/90">
              Reduce no-shows, optimize provider schedules, and deliver exceptional patient experiences 
              with our AI-powered appointment management platform.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link to="/booking">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto font-semibold">
                  Book Appointment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Staff Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-20">
        <div className="mb-12 text-center animate-fade-in">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Powerful Features for Modern Healthcare
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform combines cutting-edge AI with intuitive design to transform 
            how patients and providers manage appointments.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="shadow-soft hover:shadow-medium transition-all animate-fade-in border-border/50"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="mb-4 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-6">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="animate-fade-in">
              <h2 className="mb-6 text-3xl font-bold text-foreground md:text-4xl">
                Everything You Need for Patient Access Excellence
              </h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Built specifically for healthcare providers who want to deliver better patient 
                experiences while maximizing operational efficiency.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-foreground">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-fade-in">
              <div className="relative rounded-2xl overflow-hidden shadow-strong">
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 via-secondary/30 to-accent/20 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-4">
                      <Calendar className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">Smart Scheduling</h3>
                    <p className="text-muted-foreground">AI-powered optimization in action</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <Card className="shadow-strong bg-gradient-to-br from-primary/10 via-secondary/10 to-background border-primary/20 animate-fade-in">
          <CardContent className="p-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Ready to Transform Your Patient Access?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground max-w-2xl mx-auto">
              Join leading healthcare providers in delivering exceptional patient experiences 
              with intelligent scheduling.
            </p>
            <Link to="/booking">
              <Button size="lg" className="bg-accent hover:bg-accent/90 font-semibold">
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="container mx-auto px-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 PAAS Platform. All rights reserved.</p>
            <p className="mt-2">Reducing no-shows, improving access, maximizing provider utilization.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
