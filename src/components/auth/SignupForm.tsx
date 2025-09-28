import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface SignupFormProps {
  onSignup: (userData: {
    username: string;
    email: string;
    full_name: string;
    account_type: "pregnant" | "postnatal" | "general";
    password: string;
  }) => Promise<void>;
  onSwitchToLogin: () => void;
}

export function SignupForm({ onSignup, onSwitchToLogin }: SignupFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    full_name: "",
    account_type: "" as "pregnant" | "postnatal" | "general" | "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const accountTypeColors = {
    pregnant: "maternal",
    postnatal: "postnatal", 
    general: "general"
  };

  const accountTypeDescriptions = {
    pregnant: "For expecting mothers - specialized pregnancy care and monitoring",
    postnatal: "For new mothers - postpartum care and recovery support",
    general: "For general healthcare monitoring and wellness tracking"
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.username || !formData.email || !formData.full_name || !formData.account_type || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    
    try {
      await onSignup({
        username: formData.username,
        email: formData.email,
        full_name: formData.full_name,
        account_type: formData.account_type,
        password: formData.password,
      });
      toast({
        title: "Account Created!",
        description: "Welcome to AfyaJamii AI. You can now start your healthcare journey.",
      });
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
      toast({
        title: "Signup Failed",
        description: err.message || "Please try again with different credentials.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name</Label>
        <Input
          id="full_name"
          type="text"
          placeholder="Enter your full name"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          placeholder="Choose a username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email address"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="account_type">Account Type</Label>
        <Select 
          value={formData.account_type} 
          onValueChange={(value: "pregnant" | "postnatal" | "general") => 
            setFormData({ ...formData, account_type: value })
          }
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your care type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pregnant">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-maternal"></div>
                <span>Pregnant Care</span>
              </div>
            </SelectItem>
            <SelectItem value="postnatal">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-postnatal"></div>
                <span>Postnatal Care</span>
              </div>
            </SelectItem>
            <SelectItem value="general">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-general"></div>
                <span>General Health</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        {formData.account_type && (
          <p className="text-sm text-muted-foreground mt-1">
            {accountTypeDescriptions[formData.account_type]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          disabled={isLoading}
          required
        />
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-sm text-primary hover:text-primary-dark transition-colors"
        >
          Already have an account? Sign in
        </button>
      </div>
    </form>
  );
}