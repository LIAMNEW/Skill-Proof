import { useState, useMemo } from "react";
import { Link, useSearch } from "wouter";
import { ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import BatchAnalyzer from "@/components/BatchAnalyzer";
import Leaderboard, { type CandidateRanking } from "@/components/Leaderboard";
import ErrorCard from "@/components/ErrorCard";

export default function Compare() {
  const searchString = useSearch();
  const initialUsernames = useMemo(() => {
    const params = new URLSearchParams(searchString);
    const usernamesParam = params.get("usernames");
    return usernamesParam ? usernamesParam.split(",").filter(Boolean) : [];
  }, [searchString]);

  const [isComparing, setIsComparing] = useState(false);
  const [compareMessage, setCompareMessage] = useState("");
  const [rankings, setRankings] = useState<CandidateRanking[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async (usernames: string[], jobDescription: string) => {
    setError(null);
    setRankings(null);
    setIsComparing(true);
    
    const messages = [
      "Fetching profiles...",
      "Analyzing repositories...",
      "Extracting skills...",
      "Matching to job requirements...",
      "Ranking candidates..."
    ];
    let messageIndex = 0;
    setCompareMessage(messages[0]);
    
    const interval = setInterval(() => {
      messageIndex++;
      if (messageIndex < messages.length) {
        setCompareMessage(messages[messageIndex]);
      }
    }, 2000);

    try {
      const response = await fetch("/api/batch-compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernames, jobDescription }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to compare candidates");
      }

      const data = await response.json();
      setRankings(data.rankings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      clearInterval(interval);
      setIsComparing(false);
      setCompareMessage("");
    }
  };

  const handleRetry = () => {
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#1a1a24]">
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <header className="py-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/">
              <Button variant="ghost" className="text-gray-400 hover:text-white" data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Single Analysis
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Users className="w-8 h-8 text-amber-400" />
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                Batch Candidate Comparison
              </h1>
            </div>
            <p className="text-gray-400 text-lg">
              Compare multiple GitHub profiles against a job description
            </p>
          </div>
        </header>

        <BatchAnalyzer
          onCompare={handleCompare}
          isLoading={isComparing}
          loadingMessage={compareMessage}
          initialUsernames={initialUsernames}
        />

        {error && (
          <div className="mt-8">
            <ErrorCard message={error} onRetry={handleRetry} />
          </div>
        )}

        {rankings && !error && (
          <div className="mt-8">
            <Leaderboard rankings={rankings} />
          </div>
        )}
      </div>
    </div>
  );
}
