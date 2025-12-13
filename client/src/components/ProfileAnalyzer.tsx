import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProfileAnalyzerProps {
  onAnalyze: (username: string) => void;
  isLoading?: boolean;
  loadingMessage?: string;
}

export default function ProfileAnalyzer({ 
  onAnalyze, 
  isLoading = false, 
  loadingMessage = "Analyzing..." 
}: ProfileAnalyzerProps) {
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onAnalyze(username.trim());
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4" data-testid="profile-analyzer">
      <div className="bg-white/5 backdrop-blur-lg border border-amber-500/20 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4 text-center">
          Analyse GitHub Profile
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="e.g., torvalds, gaearon, tj"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus-visible:ring-amber-400"
              disabled={isLoading}
              data-testid="input-github-username"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isLoading || !username.trim()}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
            data-testid="button-analyse"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {loadingMessage}
              </>
            ) : (
              "Analyse"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
