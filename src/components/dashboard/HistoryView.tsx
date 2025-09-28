import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  History, 
  Activity, 
  MessageSquare, 
  Calendar,
  TrendingUp,
  Heart,
  Thermometer,
  Droplets,
  Loader2
} from "lucide-react";

interface VitalsRecord {
  id: number;
  age: number;
  systolic_bp: number;
  diastolic_bp: number;
  bs: number;
  body_temp: number;
  body_temp_unit: string;
  heart_rate: number;
  patient_history?: string;
  ml_risk_label: string;
  ml_probability: number;
  created_at: string;
}

interface ConversationRecord {
  id: number;
  user_message: string;
  ai_response: string;
  created_at: string;
}

const API_BASE_URL = "https://afyajamii.onrender.com";

export function HistoryView() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [vitalsHistory, setVitalsHistory] = useState<VitalsRecord[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationRecord[]>([]);
  const [isLoadingVitals, setIsLoadingVitals] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchVitalsHistory();
    fetchConversationHistory();
  }, []);

  const fetchVitalsHistory = async () => {
    setIsLoadingVitals(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/history/vitals?limit=20`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch vitals history");
      }

      const data = await response.json();
      setVitalsHistory(data);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load vitals history",
        variant: "destructive",
      });
    } finally {
      setIsLoadingVitals(false);
    }
  };

  const fetchConversationHistory = async () => {
    setIsLoadingConversations(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/history/conversations?limit=50`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch conversation history");
      }

      const data = await response.json();
      setConversationHistory(data);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load conversation history",
        variant: "destructive",
      });
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const getRiskColor = (riskLabel: string) => {
    switch (riskLabel?.toLowerCase()) {
      case "low": return "success";
      case "medium": return "warning";
      case "high": return "danger";
      default: return "primary";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="w-5 h-5 mr-2" />
            Health History
          </CardTitle>
          <CardDescription>
            View your previous health assessments and conversations
          </CardDescription>
        </CardHeader>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="vitals" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vitals" className="flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            Vitals Records
          </TabsTrigger>
          <TabsTrigger value="conversations" className="flex items-center">
            <MessageSquare className="w-4 h-4 mr-2" />
            AI Conversations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vitals" className="space-y-4">
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Vitals History</CardTitle>
              <CardDescription>Your health measurements and AI assessments</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingVitals ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span>Loading vitals history...</span>
                </div>
              ) : vitalsHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No vitals records found. Submit your first health assessment to get started!</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {vitalsHistory.map((record) => (
                      <Card key={record.id} className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                {formatDate(record.created_at)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground">Risk Level:</span>
                              <Badge className={`bg-${getRiskColor(record.ml_risk_label)}/10 text-${getRiskColor(record.ml_risk_label)}`}>
                                {record.ml_risk_label?.toUpperCase()}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                ({(record.ml_probability * 100)?.toFixed(1)}% confidence)
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Heart className="w-4 h-4 text-danger" />
                            <span>BP: {record.systolic_bp}/{record.diastolic_bp}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Activity className="w-4 h-4 text-primary" />
                            <span>HR: {record.heart_rate} BPM</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Thermometer className="w-4 h-4 text-warning" />
                            <span>Temp: {record.body_temp}°{record.body_temp_unit?.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Droplets className="w-4 h-4 text-secondary" />
                            <span>BS: {record.bs} mg/dL</span>
                          </div>
                        </div>

                        {record.patient_history && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-sm text-muted-foreground">
                              <strong>Notes:</strong> {record.patient_history}
                            </p>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-4">
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg">AI Conversation History</CardTitle>
              <CardDescription>Your previous chats with the AI healthcare assistant</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingConversations ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span>Loading conversation history...</span>
                </div>
              ) : conversationHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No conversation history found. Start chatting with the AI to see your conversations here!</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {conversationHistory.map((conversation) => (
                      <Card key={conversation.id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(conversation.created_at)}</span>
                          </div>

                          <div className="space-y-3">
                            <div className="bg-muted/50 p-3 rounded-lg">
                              <p className="font-medium text-sm mb-1">You asked:</p>
                              <p className="text-sm">{conversation.user_message}</p>
                            </div>

                            <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
                              <p className="font-medium text-sm mb-1 text-primary">AI responded:</p>
                              <p className="text-sm whitespace-pre-line">{conversation.ai_response}</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}