import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Activity, Thermometer, Heart, Droplets } from "lucide-react";

interface VitalsData {
  age: number;
  systolic_bp: number;
  diastolic_bp: number;
  bs: number;
  body_temp: number;
  body_temp_unit: "celsius" | "fahrenheit";
  heart_rate: number;
  patient_history?: string;
}

const API_BASE_URL = "https://afyajamii.onrender.com";

export function VitalsForm() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  
  const [vitals, setVitals] = useState<VitalsData>({
    age: 0,
    systolic_bp: 0,
    diastolic_bp: 0,
    bs: 0,
    body_temp: 0,
    body_temp_unit: "celsius",
    heart_rate: 0,
    patient_history: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/vitals/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          vitals: vitals,
          account_type: user?.account_type || "general",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to submit vitals");
      }

      const data = await response.json();
      setResult(data);
      
      toast({
        title: "Vitals Submitted Successfully!",
        description: "Your health data has been analyzed. Check the results below.",
      });
      
      // Reset form
      setVitals({
        age: 0,
        systolic_bp: 0,
        diastolic_bp: 0,
        bs: 0,
        body_temp: 0,
        body_temp_unit: "celsius",
        heart_rate: 0,
        patient_history: "",
      });
      
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Submission Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

  return (
    <div className="space-y-6">
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Submit Health Vitals
          </CardTitle>
          <CardDescription>
            Enter your current health measurements for AI analysis and personalized recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age (years)</Label>
                <Input
                  id="age"
                  type="number"
                  min="1"
                  max="120"
                  value={vitals.age || ""}
                  onChange={(e) => setVitals({ ...vitals, age: parseInt(e.target.value) || 0 })}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="heart_rate" className="flex items-center">
                  <Heart className="w-4 h-4 mr-1" />
                  Heart Rate (BPM)
                </Label>
                <Input
                  id="heart_rate"
                  type="number"
                  min="30"
                  max="220"
                  value={vitals.heart_rate || ""}
                  onChange={(e) => setVitals({ ...vitals, heart_rate: parseInt(e.target.value) || 0 })}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="systolic_bp">Systolic BP (mmHg)</Label>
                <Input
                  id="systolic_bp"
                  type="number"
                  min="70"
                  max="250"
                  value={vitals.systolic_bp || ""}
                  onChange={(e) => setVitals({ ...vitals, systolic_bp: parseInt(e.target.value) || 0 })}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diastolic_bp">Diastolic BP (mmHg)</Label>
                <Input
                  id="diastolic_bp"
                  type="number"
                  min="40"
                  max="150"
                  value={vitals.diastolic_bp || ""}
                  onChange={(e) => setVitals({ ...vitals, diastolic_bp: parseInt(e.target.value) || 0 })}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bs" className="flex items-center">
                  <Droplets className="w-4 h-4 mr-1" />
                  Blood Sugar (mg/dL)
                </Label>
                <Input
                  id="bs"
                  type="number"
                  min="30"
                  max="600"
                  value={vitals.bs || ""}
                  onChange={(e) => setVitals({ ...vitals, bs: parseInt(e.target.value) || 0 })}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body_temp" className="flex items-center">
                  <Thermometer className="w-4 h-4 mr-1" />
                  Body Temperature
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="body_temp"
                    type="number"
                    step="0.1"
                    min="30"
                    max="45"
                    value={vitals.body_temp || ""}
                    onChange={(e) => setVitals({ ...vitals, body_temp: parseFloat(e.target.value) || 0 })}
                    disabled={isLoading}
                    required
                    className="flex-1"
                  />
                  <Select
                    value={vitals.body_temp_unit}
                    onValueChange={(value: "celsius" | "fahrenheit") => 
                      setVitals({ ...vitals, body_temp_unit: value })
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="celsius">°C</SelectItem>
                      <SelectItem value="fahrenheit">°F</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient_history">Medical History (Optional)</Label>
              <Textarea
                id="patient_history"
                placeholder="Any relevant medical history, current symptoms, or concerns..."
                value={vitals.patient_history || ""}
                onChange={(e) => setVitals({ ...vitals, patient_history: e.target.value })}
                disabled={isLoading}
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Health Data...
                </>
              ) : (
                "Submit Vitals for Analysis"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle>Health Analysis Results</CardTitle>
            <CardDescription>AI-powered assessment based on your vitals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ML Model Results */}
            <div className="p-4 rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-2">Risk Assessment</h3>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm">Risk Level:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium bg-${getRiskColor(result.ml_output?.risk_label)}/10 text-${getRiskColor(result.ml_output?.risk_label)}`}>
                  {result.ml_output?.risk_label?.toUpperCase() || "Unknown"}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({(result.ml_output?.probability * 100)?.toFixed(1)}% confidence)
                </span>
              </div>
            </div>

            {/* LLM Advice */}
            {result.llm_advice?.advice && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h3 className="font-semibold mb-2 text-primary">AI Healthcare Recommendations</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-sm text-foreground whitespace-pre-line">
                    {result.llm_advice.advice}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}