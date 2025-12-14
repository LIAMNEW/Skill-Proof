import { useState } from "react";
import { Search, MapPin, GitFork, Users, Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface SearchFiltersProps {
  onSearch: (filters: {
    skills: string[];
    location: string;
    minRepos: number;
    minFollowers: number;
  }) => void;
  isLoading?: boolean;
}

export default function SearchFilters({ onSearch, isLoading = false }: SearchFiltersProps) {
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");
  const [location, setLocation] = useState("");
  const [minRepos, setMinRepos] = useState("");
  const [minFollowers, setMinFollowers] = useState("");

  const addSkill = () => {
    const trimmed = currentSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setCurrentSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      skills,
      location: location.trim(),
      minRepos: minRepos ? parseInt(minRepos, 10) : 0,
      minFollowers: minFollowers ? parseInt(minFollowers, 10) : 0,
    });
  };

  const hasFilters = skills.length > 0 || location.trim() || minRepos || minFollowers;

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-amber-500/20 rounded-2xl p-6" data-testid="search-filters">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label className="flex items-center gap-2 text-white mb-3">
            <Search className="w-4 h-4 text-amber-400" />
            Skills / Technologies
          </Label>
          <div className="flex gap-2 mb-3">
            <Input
              type="text"
              placeholder="e.g., React, Python, Machine Learning..."
              value={currentSkill}
              onChange={(e) => setCurrentSkill(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus-visible:ring-amber-400"
              disabled={isLoading}
              data-testid="input-skill"
            />
            <Button
              type="button"
              onClick={addSkill}
              disabled={!currentSkill.trim() || isLoading}
              variant="outline"
              className="border-amber-500/30 text-amber-400"
              data-testid="button-add-skill"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="bg-amber-500/20 text-amber-300 border-amber-500/30 pr-1"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-2 hover:text-white transition-colors"
                    disabled={isLoading}
                    data-testid={`button-remove-skill-${skill}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label className="flex items-center gap-2 text-white mb-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              Location
            </Label>
            <Input
              type="text"
              placeholder="e.g., San Francisco"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus-visible:ring-amber-400"
              disabled={isLoading}
              data-testid="input-location"
            />
          </div>

          <div>
            <Label className="flex items-center gap-2 text-white mb-2">
              <GitFork className="w-4 h-4 text-amber-400" />
              Min Repositories
            </Label>
            <Input
              type="number"
              placeholder="e.g., 10"
              value={minRepos}
              onChange={(e) => setMinRepos(e.target.value)}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus-visible:ring-amber-400"
              disabled={isLoading}
              min="0"
              data-testid="input-min-repos"
            />
          </div>

          <div>
            <Label className="flex items-center gap-2 text-white mb-2">
              <Users className="w-4 h-4 text-amber-400" />
              Min Followers
            </Label>
            <Input
              type="number"
              placeholder="e.g., 100"
              value={minFollowers}
              onChange={(e) => setMinFollowers(e.target.value)}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus-visible:ring-amber-400"
              disabled={isLoading}
              min="0"
              data-testid="input-min-followers"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={!hasFilters || isLoading}
          className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
          data-testid="button-search"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Search Candidates
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
