import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VitalsForm } from "./VitalsForm";
import { ChatInterface } from "./ChatInterface";
import { HistoryView } from "./HistoryView";
import { 
  Heart, 
  MessageSquare, 
  History, 
  LogOut, 
  User,
  Activity,
  TrendingUp,
  Calendar
} from "lucide-react";

type ActiveView = "vitals" | "chat" | "history";

export function Dashboard() {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState<ActiveView>("vitals");

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case "pregnant": return "maternal";
      case "postnatal": return "postnatal";
      case "general": return "general";
      default: return "primary";
    }
  };

  const getAccountTypeGradient = (type: string) => {
    switch (type) {
      case "pregnant": return "maternal-gradient";
      case "postnatal": return "postnatal-gradient";
      case "general": return "general-gradient";
      default: return "medical-gradient";
    }
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case "pregnant": return "Pregnancy Care";
      case "postnatal": return "Postnatal Care";
      case "general": return "General Health";
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-xl ${getAccountTypeGradient(user?.account_type || "general")} flex items-center justify-center`}>
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">AfyaJamii AI</h1>
                <p className="text-sm text-muted-foreground">Healthcare Support System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{user?.full_name || user?.username}</span>
                <Badge variant="secondary" className={`bg-${getAccountTypeColor(user?.account_type || "general")}/10 text-${getAccountTypeColor(user?.account_type || "general")}`}>
                  {getAccountTypeLabel(user?.account_type || "general")}
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Navigation</CardTitle>
                <CardDescription>Access your healthcare tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={activeView === "vitals" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveView("vitals")}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Submit Vitals
                </Button>
                <Button
                  variant={activeView === "chat" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveView("chat")}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  AI Chat
                </Button>
                <Button
                  variant={activeView === "history" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveView("history")}
                >
                  <History className="w-4 h-4 mr-2" />
                  Health History
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="card-shadow mt-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Last Check-up</span>
                  <span className="text-sm font-medium">--</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Risk Level</span>
                  <Badge variant="secondary">Not assessed</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Account Type</span>
                  <Badge className={`bg-${getAccountTypeColor(user?.account_type || "general")}/10 text-${getAccountTypeColor(user?.account_type || "general")}`}>
                    {getAccountTypeLabel(user?.account_type || "general")}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeView === "vitals" && <VitalsForm />}
            {activeView === "chat" && <ChatInterface />}
            {activeView === "history" && <HistoryView />}
          </div>
        </div>
      </div>
    </div>
  );
}