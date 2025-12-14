import { useState, useEffect } from "react";
import { Users, Plus, X, Loader2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface BatchAnalyzerProps {
  onCompare: (usernames: string[], jobDescription: string) => void;
  isLoading?: boolean;
  loadingMessage?: string;
  initialUsernames?: string[];
}

export default function BatchAnalyzer({
  onCompare,
  isLoading = false,
  loadingMessage = "Comparing...",
  initialUsernames = [],
}: BatchAnalyzerProps) {
  const [currentUsername, setCurrentUsername] = useState("");
  const [usernames, setUsernames] = useState<string[]>(initialUsernames);
  const [jobDescription, setJobDescription] = useState("");

  useEffect(() => {
    if (initialUsernames.length > 0) {
      setUsernames(initialUsernames);
    }
  }, [initialUsernames]);

  const addUsername = () => {
    const trimmed = currentUsername.trim().toLowerCase();
    if (trimmed && !usernames.includes(trimmed) && usernames.length < 10) {
      setUsernames([...usernames, trimmed]);
      setCurrentUsername("");
    }
  };

  const removeUsername = (username: string) => {
    setUsernames(usernames.filter((u) => u !== username));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addUsername();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernames.length >= 2 && jobDescription.trim()) {
      onCompare(usernames, jobDescription.trim());
    }
  };

  const canSubmit = usernames.length >= 2 && jobDescription.trim().length > 0;

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-amber-500/20 rounded-2xl p-6" data-testid="batch-analyzer">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-white">GitHub Usernames</h3>
            <span className="text-sm text-gray-400">({usernames.length}/10)</span>
          </div>
          
          <div className="flex gap-2 mb-3">
            <Input
              type="text"
              placeholder="Enter GitHub username..."
              value={currentUsername}
              onChange={(e) => setCurrentUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus-visible:ring-amber-400"
              disabled={isLoading || usernames.length >= 10}
              data-testid="input-add-username"
            />
            <Button
              type="button"
              onClick={addUsername}
              disabled={!currentUsername.trim() || usernames.length >= 10 || isLoading}
              variant="outline"
              className="border-amber-500/30 text-amber-400"
              data-testid="button-add-username"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {usernames.length > 0 && (
            <div className="flex flex-wrap gap-2" data-testid="username-list">
              {usernames.map((username) => (
                <Badge
                  key={username}
                  variant="secondary"
                  className="bg-amber-500/20 text-amber-300 border-amber-500/30 pr-1"
                >
                  @{username}
                  <button
                    type="button"
                    onClick={() => removeUsername(username)}
                    className="ml-2 hover:text-white transition-colors"
                    disabled={isLoading}
                    data-testid={`button-remove-${username}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {usernames.length === 0 && (
            <p className="text-sm text-gray-500">
              Add at least 2 usernames to compare (e.g., torvalds, gaearon, tj)
            </p>
          )}
          {usernames.length === 1 && (
            <p className="text-sm text-amber-400">
              Add at least one more username to enable comparison
            </p>
          )}
        </div>

        <div className="border-t border-white/10 pt-6">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-white">Job Description</h3>
          </div>
          
          <Textarea
            placeholder="Paste the full job description here. Include required skills, responsibilities, and qualifications for better matching accuracy..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="min-h-[150px] bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus-visible:ring-amber-400"
            disabled={isLoading}
            data-testid="input-job-description"
          />
        </div>

        <Button
          type="submit"
          disabled={!canSubmit || isLoading}
          className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
          data-testid="button-compare"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {loadingMessage}
            </>
          ) : (
            <>
              <Users className="w-4 h-4 mr-2" />
              Compare {usernames.length} Candidates
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
