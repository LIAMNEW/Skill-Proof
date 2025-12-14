import { useState } from "react";
import Header from "@/components/Header";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Search, MapPin, GitBranch, Users as UsersIcon, Loader2, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface Developer {
  username: string;
  name: string;
  avatar: string;
  bio: string;
  repos: number;
  followers: number;
  location: string;
  profileUrl: string;
}

interface SearchResult {
  developers: Developer[];
  totalCount: number;
  query: string;
}

export default function CandidateSearch() {
  const [, setLocation] = useLocation();
  const [skills, setSkills] = useState<string[]>([""]);
  const [location, setLocationFilter] = useState("");
  const [minRepos, setMinRepos] = useState("");
  const [minFollowers, setMinFollowers] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsernames, setSelectedUsernames] = useState<Set<string>>(new Set());

  const addSkill = () => {
    if (skills.length < 5) {
      setSkills([...skills, ""]);
    }
  };

  const removeSkill = (index: number) => {
    if (skills.length > 1) {
      setSkills(skills.filter((_, i) => i !== index));
    }
  };

  const updateSkill = (index: number, value: string) => {
    const updated = [...skills];
    updated[index] = value;
    setSkills(updated);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const validSkills = skills.filter(s => s.trim());
    
    if (validSkills.length === 0) {
      setError("Please enter at least one skill to search for");
      return;
    }

    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/search-developers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: validSkills,
          location: location.trim() || undefined,
          minRepos: minRepos ? parseInt(minRepos) : undefined,
          minFollowers: minFollowers ? parseInt(minFollowers) : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to search developers");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = (username: string) => {
    const updated = new Set(selectedUsernames);
    if (updated.has(username)) {
      updated.delete(username);
    } else {
      updated.add(username);
    }
    setSelectedUsernames(updated);
  };

  const goToCompare = () => {
    const usernames = Array.from(selectedUsernames);
    sessionStorage.setItem("compareUsernames", JSON.stringify(usernames));
    setLocation("/compare");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#1a1a24]">
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <Header />
        
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-gray-400" data-testid="link-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Single Analysis
            </Button>
          </Link>
        </div>

        <div className="bg-white/5 backdrop-blur-lg border border-amber-500/20 rounded-2xl p-6 mb-8" data-testid="search-form">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-amber-500/20">
              <Search className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Find Developers</h2>
          </div>

          <form onSubmit={handleSearch} className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">Skills / Technologies</label>
              {skills.map((skill, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder={`e.g., React, Python, Go`}
                    value={skill}
                    onChange={(e) => updateSkill(index, e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus-visible:ring-amber-400"
                    disabled={isLoading}
                    data-testid={`input-skill-${index}`}
                  />
                  {skills.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSkill(index)}
                      disabled={isLoading}
                      className="text-gray-400"
                      data-testid={`button-remove-skill-${index}`}
                    >
                      <span className="sr-only">Remove</span>
                      <span className="text-lg">-</span>
                    </Button>
                  )}
                </div>
              ))}
              {skills.length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSkill}
                  disabled={isLoading}
                  className="border-white/20 text-gray-300"
                  data-testid="button-add-skill"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Skill
                </Button>
              )}
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </label>
                <Input
                  type="text"
                  placeholder="e.g., San Francisco"
                  value={location}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus-visible:ring-amber-400"
                  disabled={isLoading}
                  data-testid="input-location"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <GitBranch className="w-4 h-4" />
                  Min Repos
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 10"
                  value={minRepos}
                  onChange={(e) => setMinRepos(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus-visible:ring-amber-400"
                  disabled={isLoading}
                  data-testid="input-min-repos"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <UsersIcon className="w-4 h-4" />
                  Min Followers
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 100"
                  value={minFollowers}
                  onChange={(e) => setMinFollowers(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus-visible:ring-amber-400"
                  disabled={isLoading}
                  data-testid="input-min-followers"
                />
              </div>
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
              data-testid="button-search"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching GitHub...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search Developers
                </>
              )}
            </Button>
          </form>
        </div>

        {result && (
          <div className="space-y-6" data-testid="search-results">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-2xl font-bold text-white">Search Results</h3>
                <p className="text-sm text-gray-400" data-testid="text-result-count">
                  Found {result.totalCount.toLocaleString()} developers
                </p>
              </div>
              
              {selectedUsernames.size > 0 && (
                <Button
                  onClick={goToCompare}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
                  data-testid="button-compare-selected"
                >
                  Compare {selectedUsernames.size} Selected
                </Button>
              )}
            </div>

            <div className="grid gap-4">
              {result.developers.map((dev) => (
                <Card
                  key={dev.username}
                  className={`bg-white/5 border-amber-500/20 cursor-pointer transition-all ${
                    selectedUsernames.has(dev.username) ? "ring-2 ring-amber-400" : ""
                  }`}
                  onClick={() => toggleSelection(dev.username)}
                  data-testid={`card-developer-${dev.username}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4 flex-wrap">
                      <Avatar className="w-14 h-14 border-2 border-amber-500/30">
                        <AvatarImage src={dev.avatar} alt={dev.name} />
                        <AvatarFallback className="bg-amber-500/20 text-amber-400">
                          {dev.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-lg font-semibold text-white">{dev.name}</h4>
                          <span className="text-gray-400">@{dev.username}</span>
                          <a
                            href={dev.profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-amber-400"
                            data-testid={`link-profile-${dev.username}`}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                        {dev.bio && (
                          <p className="text-sm text-gray-300 mt-1 line-clamp-2">{dev.bio}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-400 flex-wrap">
                          {dev.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {dev.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <GitBranch className="w-3 h-3" />
                            {dev.repos} repos
                          </span>
                          <span className="flex items-center gap-1">
                            <UsersIcon className="w-3 h-3" />
                            {dev.followers} followers
                          </span>
                        </div>
                      </div>

                      <Badge
                        className={
                          selectedUsernames.has(dev.username)
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : "bg-white/10 text-gray-300 border-white/20"
                        }
                        data-testid={`badge-selection-${dev.username}`}
                      >
                        {selectedUsernames.has(dev.username) ? "Selected" : "Click to Select"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
