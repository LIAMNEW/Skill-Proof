import { User, GitFork, Users as UsersIcon, MapPin, Check } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";

export interface SearchCandidate {
  username: string;
  name: string;
  avatar: string;
  bio: string;
  location: string;
  repos: number;
  followers: number;
}

interface SearchResultsProps {
  candidates: SearchCandidate[];
  selectedUsernames: string[];
  onToggleSelect: (username: string) => void;
}

export default function SearchResults({
  candidates,
  selectedUsernames,
  onToggleSelect,
}: SearchResultsProps) {
  if (candidates.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400">No candidates found matching your criteria</p>
        <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="search-results">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">
          Found {candidates.length} Candidates
        </h2>
        {selectedUsernames.length > 0 && (
          <span className="text-amber-400 text-sm">
            {selectedUsernames.length} selected for comparison
          </span>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {candidates.map((candidate) => {
          const isSelected = selectedUsernames.includes(candidate.username);
          return (
            <div
              key={candidate.username}
              className={`
                border rounded-2xl p-4 backdrop-blur-lg cursor-pointer transition-all duration-200
                ${isSelected 
                  ? "border-amber-400 bg-amber-500/10" 
                  : "border-white/10 bg-white/5 hover:border-amber-500/40"
                }
              `}
              onClick={() => onToggleSelect(candidate.username)}
              data-testid={`candidate-card-${candidate.username}`}
            >
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Avatar className="w-14 h-14 border-2 border-amber-400/50">
                    <AvatarImage src={candidate.avatar} alt={candidate.name} />
                    <AvatarFallback>
                      <User className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div 
                    className={`
                      absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center
                      ${isSelected 
                        ? "bg-amber-500 text-slate-900" 
                        : "bg-white/10 border border-white/20"
                      }
                    `}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-white truncate">
                      {candidate.name}
                    </h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">@{candidate.username}</p>

                  {candidate.bio && (
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {candidate.bio}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <GitFork className="w-4 h-4" />
                      {candidate.repos} repos
                    </span>
                    <span className="flex items-center gap-1">
                      <UsersIcon className="w-4 h-4" />
                      {candidate.followers} followers
                    </span>
                    {candidate.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {candidate.location}
                      </span>
                    )}
                  </div>
                </div>

                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleSelect(candidate.username)}
                  className="border-amber-500/50 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                  data-testid={`checkbox-${candidate.username}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
