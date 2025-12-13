import { useState } from "react";
import Header from "@/components/Header";
import ProfileAnalyzer from "@/components/ProfileAnalyzer";
import ProfileResults, { type ProfileData } from "@/components/ProfileResults";
import JobMatcher from "@/components/JobMatcher";
import MatchResults from "@/components/MatchResults";
import ErrorCard from "@/components/ErrorCard";

interface MatchData {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  recommendation: "hire" | "interview" | "pass";
  reasoning: string;
  strengthsForRole?: string[];
}

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeMessage, setAnalyzeMessage] = useState("");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [isMatching, setIsMatching] = useState(false);
  const [matchData, setMatchData] = useState<MatchData | null>(null);

  const handleAnalyze = async (username: string) => {
    setError(null);
    setProfile(null);
    setMatchData(null);
    setIsAnalyzing(true);
    
    const messages = ["Fetching profile...", "Loading repositories...", "Analyzing code patterns...", "Extracting skills..."];
    let messageIndex = 0;
    setAnalyzeMessage(messages[0]);
    
    const interval = setInterval(() => {
      messageIndex++;
      if (messageIndex < messages.length) {
        setAnalyzeMessage(messages[messageIndex]);
      }
    }, 1500);

    try {
      const response = await fetch("/api/analyze-github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze profile");
      }

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      clearInterval(interval);
      setIsAnalyzing(false);
      setAnalyzeMessage("");
    }
  };

  const handleMatch = async (jobDescription: string) => {
    if (!profile) return;
    
    setIsMatching(true);
    setMatchData(null);

    try {
      const response = await fetch("/api/match-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, jobDescription }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to calculate match");
      }

      const data = await response.json();
      setMatchData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsMatching(false);
    }
  };

  const handleRetry = () => {
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <Header />
        
        <ProfileAnalyzer 
          onAnalyze={handleAnalyze}
          isLoading={isAnalyzing}
          loadingMessage={analyzeMessage}
        />

        {error && (
          <div className="mt-8">
            <ErrorCard message={error} onRetry={handleRetry} />
          </div>
        )}

        {profile && !error && (
          <div className="mt-8 space-y-8">
            <ProfileResults profile={profile} />
            
            <div className="border-t border-white/10 pt-8">
              <JobMatcher 
                onMatch={handleMatch}
                isLoading={isMatching}
                disabled={!profile}
              />
            </div>

            {matchData && (
              <div className="mt-8">
                <MatchResults 
                  matchScore={matchData.matchScore}
                  matchingSkills={matchData.matchingSkills}
                  missingSkills={matchData.missingSkills}
                  recommendation={matchData.recommendation}
                  reasoning={matchData.reasoning}
                  strengthsForRole={matchData.strengthsForRole}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
