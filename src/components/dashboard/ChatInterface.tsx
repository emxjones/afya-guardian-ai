import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquare, Send, Bot, User } from "lucide-react";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const API_BASE_URL = "https://afyajamii.onrender.com";

export function ChatInterface() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Welcome message
    setMessages([
      {
        id: "welcome",
        text: `Hello ${user?.full_name || user?.username}! I'm your AI healthcare assistant. I can help you understand your health data, provide personalized recommendations, and answer questions about your wellbeing. How can I assist you today?`,
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  }, [user]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;

    const userMessage = currentMessage.trim();
    setCurrentMessage("");
    setError("");

    // Add user message
    const userMsgObj: Message = {
      id: Date.now().toString(),
      text: userMessage,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsgObj]);

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat/advice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: userMessage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to get AI response");
      }

      const data = await response.json();
      
      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.advice,
        isUser: false,
        timestamp: new Date(data.timestamp),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Chat Error",
        description: err.message,
        variant: "destructive",
      });
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble responding right now. Please make sure you have submitted your vitals data first, then try asking your question again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case "pregnant": return "maternal";
      case "postnatal": return "postnatal";
      case "general": return "general";
      default: return "primary";
    }
  };

  return (
    <Card className="card-shadow h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          AI Healthcare Chat
        </CardTitle>
        <CardDescription>
          Get personalized health advice and ask questions about your wellbeing
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {error && (
          <Alert variant="destructive" className="mx-6 mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 px-6" ref={scrollRef}>
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.isUser ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.isUser 
                    ? `bg-${getAccountTypeColor(user?.account_type || "general")}/10` 
                    : "bg-primary/10"
                }`}>
                  {message.isUser ? (
                    <User className={`w-4 h-4 text-${getAccountTypeColor(user?.account_type || "general")}`} />
                  ) : (
                    <Bot className="w-4 h-4 text-primary" />
                  )}
                </div>
                
                <div className={`max-w-[80%] ${message.isUser ? "text-right" : "text-left"}`}>
                  <div className={`p-3 rounded-lg ${
                    message.isUser
                      ? `bg-${getAccountTypeColor(user?.account_type || "general")}/10 text-${getAccountTypeColor(user?.account_type || "general")}-foreground`
                      : "bg-muted text-muted-foreground"
                  }`}>
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t border-border p-6">
          <form onSubmit={sendMessage} className="flex space-x-2">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Ask about your health, symptoms, or get recommendations..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !currentMessage.trim()}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">
            Note: Make sure to submit your vitals first for personalized health advice.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}