import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Search, UserSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchFilters from "@/components/SearchFilters";
import SearchResults, { type SearchCandidate } from "@/components/SearchResults";
import ErrorCard from "@/components/ErrorCard";

export default function SearchPage() {
  const [, setLocation] = useLocation();
  const [isSearching, setIsSearching] = useState(false);
  const [candidates, setCandidates] = useState<SearchCandidate[] | null>(null);
  const [selectedUsernames, setSelectedUsernames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (filters: {
    skills: string[];
    location: string;
    minRepos: number;
    minFollowers: number;
  }) => {
    setError(null);
    setCandidates(null);
    setIsSearching(true);

    try {
      const response = await fetch("/api/search-candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to search candidates");
      }

      const data = await response.json();
      setCandidates(data.candidates);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSearching(false);
    }
  };

  const handleToggleSelect = (username: string) => {
    setSelectedUsernames((prev) =>
      prev.includes(username)
        ? prev.filter((u) => u !== username)
        : [...prev, username]
    );
  };

  const handleCompareSelected = () => {
    if (selectedUsernames.length >= 2) {
      const params = new URLSearchParams();
      params.set("usernames", selectedUsernames.join(","));
      setLocation(`/compare?${params.toString()}`);
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
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <UserSearch className="w-8 h-8 text-amber-400" />
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                Candidate Discovery
              </h1>
            </div>
            <p className="text-gray-400 text-lg">
              Search GitHub for developers matching your criteria
            </p>
          </div>
        </header>

        <SearchFilters onSearch={handleSearch} isLoading={isSearching} />

        {error && (
          <div className="mt-8">
            <ErrorCard message={error} onRetry={handleRetry} />
          </div>
        )}

        {candidates && !error && (
          <div className="mt-8">
            <SearchResults
              candidates={candidates}
              selectedUsernames={selectedUsernames}
              onToggleSelect={handleToggleSelect}
            />

            {selectedUsernames.length >= 2 && (
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={handleCompareSelected}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
                  data-testid="button-compare-selected"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Compare {selectedUsernames.length} Selected Candidates
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
