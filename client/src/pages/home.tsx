import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Users, Search, History, X, Save, FolderOpen, FileDown, Dna, MessageCircleQuestion, GitPullRequest } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import ProfileAnalyzer from "@/components/ProfileAnalyzer";
import ProfileResults, { type ProfileData } from "@/components/ProfileResults";
import JobMatcher from "@/components/JobMatcher";
import MatchResults from "@/components/MatchResults";
import ErrorCard from "@/components/ErrorCard";
import CodeDNACard from "@/components/CodeDNACard";
import InterviewQuestionsCard from "@/components/InterviewQuestionsCard";
import OpenSourceContributionsCard from "@/components/OpenSourceContributionsCard";
import type { CodeDNA } from "@shared/schema";

interface InterviewQuestion {
  skill: string;
  question: string;
  difficulty: "easy" | "medium" | "hard";
  category: "conceptual" | "practical" | "scenario";
  followUp?: string;
}

interface MatchData {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  recommendation: "hire" | "interview" | "pass";
  reasoning: string;
  strengthsForRole?: string[];
}

interface SavedProfile {
  profile: ProfileData;
  timestamp: number;
}

const STORAGE_KEY = "skillproof_profiles";
const STORAGE_LIMIT = 10;

function getSavedProfiles(): SavedProfile[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveProfile(profile: ProfileData): void {
  try {
    const profiles = getSavedProfiles();
    const existingIndex = profiles.findIndex(p => p.profile.username.toLowerCase() === profile.username.toLowerCase());
    
    if (existingIndex >= 0) {
      profiles[existingIndex] = { profile, timestamp: Date.now() };
    } else {
      profiles.unshift({ profile, timestamp: Date.now() });
    }
    
    const limited = profiles.slice(0, STORAGE_LIMIT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
  } catch (e) {
    console.error("Failed to save profile:", e);
  }
}

function removeProfile(username: string): SavedProfile[] {
  try {
    const profiles = getSavedProfiles().filter(
      p => p.profile.username.toLowerCase() !== username.toLowerCase()
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    return profiles;
  } catch {
    return [];
  }
}

export default function Home() {
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [analyseMessage, setAnalyseMessage] = useState("");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  
  const [isMatching, setIsMatching] = useState(false);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [codeDna, setCodeDna] = useState<CodeDNA | null>(null);
  const [isAnalyzingDna, setIsAnalyzingDna] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [contributions, setContributions] = useState<{
    contributions: any[];
    totalExternalRepos: number;
    totalContributions: number;
  } | null>(null);
  const [isFetchingContributions, setIsFetchingContributions] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    setSavedProfiles(getSavedProfiles());
  }, []);

  const handleAnalyse = async (username: string) => {
    setError(null);
    setProfile(null);
    setMatchData(null);
    setCodeDna(null);
    setInterviewQuestions([]);
    setContributions(null);
    setIsAnalysing(true);
    
    const messages = ["Fetching profile...", "Loading repositories...", "Analysing code patterns...", "Extracting skills..."];
    let messageIndex = 0;
    setAnalyseMessage(messages[0]);
    
    const interval = setInterval(() => {
      messageIndex++;
      if (messageIndex < messages.length) {
        setAnalyseMessage(messages[messageIndex]);
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
      saveProfile(data);
      setSavedProfiles(getSavedProfiles());
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      clearInterval(interval);
      setIsAnalysing(false);
      setAnalyseMessage("");
    }
  };

  const handleLoadSavedProfile = (savedProfile: ProfileData) => {
    setProfile(savedProfile);
    setMatchData(null);
    setCodeDna(null);
    setInterviewQuestions([]);
    setContributions(null);
    setError(null);
  };

  const handleRemoveSavedProfile = (username: string, e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setSavedProfiles(removeProfile(username));
  };

  const handleMatch = async (jd: string) => {
    if (!profile) return;
    
    setIsMatching(true);
    setMatchData(null);
    setInterviewQuestions([]);
    setJobDescription(jd);

    try {
      const response = await fetch("/api/match-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, jobDescription: jd }),
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

  const handleSaveAnalysis = async () => {
    if (!profile) return;
    
    setIsSaving(true);
    try {
      const response = await fetch("/api/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: profile.username,
          profileData: profile,
          matchData: matchData || null,
          jobDescription: jobDescription || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save analysis");
      }

      toast({
        title: "Analysis saved",
        description: `${profile.username}'s analysis has been saved to database.`,
      });
    } catch (err) {
      toast({
        title: "Failed to save",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPdf = async () => {
    if (!profile) return;
    
    setIsExporting(true);
    try {
      const response = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          matchData: matchData || null,
          jobDescription: jobDescription || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${profile.username}-skillproof-report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "PDF downloaded",
        description: "Your report has been downloaded successfully.",
      });
    } catch (err) {
      toast({
        title: "Failed to export",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleAnalyzeCodeDNA = async () => {
    if (!profile) return;
    
    setIsAnalyzingDna(true);
    try {
      const response = await fetch("/api/code-dna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: profile.username }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze Code DNA");
      }

      const data = await response.json();
      setCodeDna(data);
    } catch (err) {
      toast({
        title: "Failed to analyze Code DNA",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzingDna(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!matchData || !matchData.missingSkills || matchData.missingSkills.length === 0) return;
    
    setIsGeneratingQuestions(true);
    try {
      const response = await fetch("/api/interview-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          missingSkills: matchData.missingSkills, 
          jobDescription 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate questions");
      }

      const data = await response.json();
      setInterviewQuestions(data.questions);
    } catch (err) {
      toast({
        title: "Failed to generate questions",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleFetchContributions = async () => {
    if (!profile) return;
    
    setIsFetchingContributions(true);
    try {
      const response = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: profile.username }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch contributions");
      }

      const data = await response.json();
      setContributions(data);
    } catch (err) {
      toast({
        title: "Failed to fetch contributions",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsFetchingContributions(false);
    }
  };

  const handleRetry = () => {
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#1a1a24]">
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <Header />
        
        <ProfileAnalyzer 
          onAnalyze={handleAnalyse}
          isLoading={isAnalysing}
          loadingMessage={analyseMessage}
        />

        <div className="max-w-xl mx-auto mt-6 flex justify-center gap-4 flex-wrap">
          <Link href="/compare">
            <Button variant="outline" className="border-amber-500/30 text-amber-400" data-testid="link-batch-compare">
              <Users className="w-4 h-4 mr-2" />
              Compare Multiple Candidates
            </Button>
          </Link>
          <Link href="/search">
            <Button variant="outline" className="border-amber-500/30 text-amber-400" data-testid="link-search-developers">
              <Search className="w-4 h-4 mr-2" />
              Find Developers
            </Button>
          </Link>
          <Link href="/saved">
            <Button variant="outline" className="border-amber-500/30 text-amber-400" data-testid="link-saved-analyses">
              <FolderOpen className="w-4 h-4 mr-2" />
              Saved Analyses
            </Button>
          </Link>
        </div>

        {savedProfiles.length > 0 && (
          <div className="max-w-xl mx-auto mt-8">
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-medium text-white/70">Recent Profiles</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {savedProfiles.map((saved) => (
                <button
                  key={saved.profile.username}
                  onClick={() => handleLoadSavedProfile(saved.profile)}
                  className="group flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-sm text-white/80 hover-elevate"
                  data-testid={`button-load-profile-${saved.profile.username}`}
                >
                  <img
                    src={saved.profile.avatar}
                    alt={saved.profile.username}
                    className="w-5 h-5 rounded-full"
                  />
                  <span>{saved.profile.username}</span>
                  <button
                    onClick={(e) => handleRemoveSavedProfile(saved.profile.username, e)}
                    className="opacity-0 group-hover:opacity-100 ml-1 text-white/40 hover:text-white/80"
                    data-testid={`button-remove-profile-${saved.profile.username}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-8">
            <ErrorCard message={error} onRetry={handleRetry} />
          </div>
        )}

        {profile && !error && (
          <div className="mt-8 space-y-8">
            <ProfileResults profile={profile} />
            
            <div className="flex justify-center gap-4 flex-wrap">
              <Button
                onClick={handleSaveAnalysis}
                disabled={isSaving}
                variant="outline"
                className="border-amber-500/30 text-amber-400"
                data-testid="button-save-analysis"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Analysis"}
              </Button>
              <Button
                onClick={handleExportPdf}
                disabled={isExporting}
                variant="outline"
                className="border-amber-500/30 text-amber-400"
                data-testid="button-export-pdf"
              >
                <FileDown className="w-4 h-4 mr-2" />
                {isExporting ? "Generating..." : "Download PDF Report"}
              </Button>
              <Button
                onClick={handleAnalyzeCodeDNA}
                disabled={isAnalyzingDna}
                variant="outline"
                className="border-amber-500/30 text-amber-400"
                data-testid="button-analyze-dna"
              >
                <Dna className="w-4 h-4 mr-2" />
                {isAnalyzingDna ? "Analyzing DNA..." : "Generate Code DNA"}
              </Button>
              <Button
                onClick={handleFetchContributions}
                disabled={isFetchingContributions}
                variant="outline"
                className="border-amber-500/30 text-amber-400"
                data-testid="button-fetch-contributions"
              >
                <GitPullRequest className="w-4 h-4 mr-2" />
                {isFetchingContributions ? "Loading..." : "Open Source Contributions"}
              </Button>
            </div>
            
            {codeDna && (
              <CodeDNACard dna={codeDna} />
            )}
            
            {contributions && (
              <OpenSourceContributionsCard
                contributions={contributions.contributions}
                totalExternalRepos={contributions.totalExternalRepos}
                totalContributions={contributions.totalContributions}
              />
            )}
            
            <div className="border-t border-white/10 pt-8">
              <JobMatcher 
                onMatch={handleMatch}
                isLoading={isMatching}
                disabled={!profile}
              />
            </div>

            {matchData && (
              <div className="mt-8 space-y-6">
                <MatchResults 
                  matchScore={matchData.matchScore}
                  matchingSkills={matchData.matchingSkills}
                  missingSkills={matchData.missingSkills}
                  recommendation={matchData.recommendation}
                  reasoning={matchData.reasoning}
                  strengthsForRole={matchData.strengthsForRole}
                />
                
                {matchData.missingSkills && matchData.missingSkills.length > 0 && (
                  <div className="flex justify-center">
                    <Button
                      onClick={handleGenerateQuestions}
                      disabled={isGeneratingQuestions}
                      variant="outline"
                      className="border-amber-500/30 text-amber-400"
                      data-testid="button-generate-questions"
                    >
                      <MessageCircleQuestion className="w-4 h-4 mr-2" />
                      {isGeneratingQuestions ? "Generating Questions..." : "Generate Interview Questions"}
                    </Button>
                  </div>
                )}
                
                {interviewQuestions.length > 0 && (
                  <InterviewQuestionsCard questions={interviewQuestions} />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
