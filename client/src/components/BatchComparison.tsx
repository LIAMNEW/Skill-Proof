import { useState } from "react";
import { Users, Loader2, X, Plus, Trophy, Medal, Award, CheckCircle, AlertCircle, MinusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Language {
  name: string;
  percentage: number;
  color: string;
}

interface MatchData {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  strengthsForRole: string[];
  recommendation: "hire" | "interview" | "pass";
  reasoning: string;
}

interface CandidateRanking {
  username: string;
  name: string;
  avatar: string;
  bio: string;
  repos: number;
  followers: number;
  location?: string;
  languages: Language[];
  skills: string[];
  proficiencyLevels: Record<string, string>;
  experienceSummary: string;
  strengths: string[];
  notableProjects: string[];
  matchData: MatchData;
  rank: number;
}

interface BatchComparisonResult {
  candidates: CandidateRanking[];
  errors: { username: string; error: string }[];
  totalAnalyzed: number;
  totalFailed: number;
}

export default function BatchComparison() {
  const [usernames, setUsernames] = useState<string[]>(() => {
    const stored = sessionStorage.getItem("compareUsernames");
    if (stored) {
      sessionStorage.removeItem("compareUsernames");
      try {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : [""];
      } catch {
        return [""];
      }
    }
    return [""];
  });
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [result, setResult] = useState<BatchComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addUsername = () => {
    if (usernames.length < 20) {
      setUsernames([...usernames, ""]);
    }
  };

  const removeUsername = (index: number) => {
    if (usernames.length > 1) {
      setUsernames(usernames.filter((_, i) => i !== index));
    }
  };

  const updateUsername = (index: number, value: string) => {
    const updated = [...usernames];
    updated[index] = value;
    setUsernames(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validUsernames = usernames.filter(u => u.trim());
    
    if (validUsernames.length === 0) {
      setError("Please enter at least one GitHub username");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please enter a job description");
      return;
    }

    setError(null);
    setResult(null);
    setIsLoading(true);

    const messages = [
      "Fetching GitHub profiles...",
      "Analysing repositories...",
      "Extracting technical skills...",
      "Matching to job requirements...",
      "Ranking candidates..."
    ];
    let messageIndex = 0;
    setLoadingMessage(messages[0]);
    
    const interval = setInterval(() => {
      messageIndex++;
      if (messageIndex < messages.length) {
        setLoadingMessage(messages[messageIndex]);
      }
    }, 3000);

    try {
      const response = await fetch("/api/batch-compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          usernames: validUsernames, 
          jobDescription: jobDescription.trim() 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to compare candidates");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      clearInterval(interval);
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-6 h-6 text-amber-400" />;
      case 2: return <Medal className="w-6 h-6 text-gray-300" />;
      case 3: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-gray-400 font-bold">#{rank}</span>;
    }
  };

  const getRecommendationStyle = (recommendation: string) => {
    switch (recommendation) {
      case "hire":
        return { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/20" };
      case "interview":
        return { icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/20" };
      default:
        return { icon: MinusCircle, color: "text-red-400", bg: "bg-red-500/20" };
    }
  };

  return (
    <div className="space-y-8" data-testid="batch-comparison">
      <div className="bg-white/5 backdrop-blur-lg border border-amber-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-amber-500/20">
            <Users className="w-5 h-5 text-amber-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Batch Candidate Comparison</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">GitHub Usernames (up to 20)</label>
            {usernames.map((username, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="text"
                  placeholder={`GitHub username ${index + 1}`}
                  value={username}
                  onChange={(e) => updateUsername(index, e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus-visible:ring-amber-400"
                  disabled={isLoading}
                  data-testid={`input-username-${index}`}
                />
                {usernames.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeUsername(index)}
                    disabled={isLoading}
                    className="text-gray-400"
                    data-testid={`button-remove-username-${index}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {usernames.length < 20 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addUsername}
                disabled={isLoading}
                className="border-white/20 text-gray-300"
                data-testid="button-add-username"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Job Description</label>
            <Textarea
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="min-h-[120px] bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus-visible:ring-amber-400"
              disabled={isLoading}
              data-testid="input-job-description"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300" data-testid="text-error">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
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
                Compare Candidates
              </>
            )}
          </Button>
        </form>
      </div>

      {result && (
        <div className="space-y-6" data-testid="comparison-results">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">Candidate Leaderboard</h3>
            <div className="flex gap-4 text-sm text-gray-400">
              <span data-testid="text-total-analyzed">{result.totalAnalyzed} analysed</span>
              {result.totalFailed > 0 && (
                <span className="text-red-400" data-testid="text-total-failed">{result.totalFailed} failed</span>
              )}
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <h4 className="text-sm font-medium text-red-300 mb-2">Failed to analyse:</h4>
              <div className="flex flex-wrap gap-2">
                {result.errors.map((err, idx) => (
                  <Badge key={idx} variant="outline" className="border-red-500/30 text-red-300">
                    {err.username}: {err.error}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {result.candidates.map((candidate) => {
              const recStyle = getRecommendationStyle(candidate.matchData.recommendation);
              const RecIcon = recStyle.icon;
              
              return (
                <Card 
                  key={candidate.username} 
                  className="bg-white/5 border-amber-500/20"
                  data-testid={`card-candidate-${candidate.username}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10">
                          {getRankIcon(candidate.rank)}
                        </div>
                        <Avatar className="w-12 h-12 border-2 border-amber-500/30">
                          <AvatarImage src={candidate.avatar} alt={candidate.name} />
                          <AvatarFallback className="bg-amber-500/20 text-amber-400">
                            {candidate.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-white">{candidate.name}</CardTitle>
                          <p className="text-sm text-gray-400">@{candidate.username}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-3xl font-bold text-amber-400" data-testid={`text-score-${candidate.username}`}>
                            {candidate.matchData.matchScore}%
                          </div>
                          <div className="text-xs text-gray-400">Match Score</div>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${recStyle.bg}`}>
                          <RecIcon className={`w-4 h-4 ${recStyle.color}`} />
                          <span className={`text-sm font-medium capitalize ${recStyle.color}`} data-testid={`text-recommendation-${candidate.username}`}>
                            {candidate.matchData.recommendation}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-4 space-y-4">
                    <p className="text-sm text-gray-300">{candidate.matchData.reasoning}</p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-medium text-gray-400 mb-2">Matching Skills</h4>
                        <div className="flex flex-wrap gap-1">
                          {candidate.matchData.matchingSkills.slice(0, 5).map((skill, idx) => (
                            <Badge key={idx} className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                              {skill}
                            </Badge>
                          ))}
                          {candidate.matchData.matchingSkills.length > 5 && (
                            <Badge variant="outline" className="border-gray-500/30 text-gray-400">
                              +{candidate.matchData.matchingSkills.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-medium text-gray-400 mb-2">Missing Skills</h4>
                        <div className="flex flex-wrap gap-1">
                          {candidate.matchData.missingSkills.slice(0, 5).map((skill, idx) => (
                            <Badge key={idx} variant="outline" className="border-red-500/30 text-red-300">
                              {skill}
                            </Badge>
                          ))}
                          {candidate.matchData.missingSkills.length > 5 && (
                            <Badge variant="outline" className="border-gray-500/30 text-gray-400">
                              +{candidate.matchData.missingSkills.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
