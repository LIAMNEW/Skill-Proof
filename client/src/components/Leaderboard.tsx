import { Trophy, CheckCircle, XCircle, User, GitFork, Users as UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Language {
  name: string;
  percentage: number;
  color: string;
}

interface ProfileData {
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
  strengths?: string[];
  notableProjects?: string[];
}

export interface CandidateRanking {
  rank: number;
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  strengthsForRole?: string[];
  recommendation: "hire" | "interview" | "pass";
  reasoning: string;
  profile: ProfileData;
}

interface LeaderboardProps {
  rankings: CandidateRanking[];
}

function getRankStyle(rank: number) {
  switch (rank) {
    case 1:
      return "border-amber-400 bg-gradient-to-r from-amber-900/30 to-amber-800/20";
    case 2:
      return "border-gray-400 bg-gradient-to-r from-gray-800/30 to-gray-700/20";
    case 3:
      return "border-amber-700 bg-gradient-to-r from-amber-950/30 to-amber-900/20";
    default:
      return "border-white/10 bg-white/5";
  }
}

function getRankBadge(rank: number) {
  switch (rank) {
    case 1:
      return <Trophy className="w-6 h-6 text-amber-400" />;
    case 2:
      return <span className="text-2xl font-bold text-gray-400">2</span>;
    case 3:
      return <span className="text-2xl font-bold text-amber-700">3</span>;
    default:
      return <span className="text-xl font-semibold text-gray-500">{rank}</span>;
  }
}

function getRecommendationStyle(recommendation: string) {
  switch (recommendation) {
    case "hire":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "interview":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "pass":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}

export default function Leaderboard({ rankings }: LeaderboardProps) {
  if (rankings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        No candidates to display
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="leaderboard">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-6 h-6 text-amber-400" />
        <h2 className="text-2xl font-bold text-white">Candidate Rankings</h2>
      </div>

      {rankings.map((candidate) => (
        <div
          key={candidate.profile.username}
          className={`border rounded-2xl p-5 backdrop-blur-lg transition-all duration-300 ${getRankStyle(candidate.rank)}`}
          data-testid={`candidate-card-${candidate.profile.username}`}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 flex items-center justify-center">
                  {getRankBadge(candidate.rank)}
                </div>
                <Avatar className="w-16 h-16 border-2 border-amber-400/50">
                  <AvatarImage src={candidate.profile.avatar} alt={candidate.profile.name} />
                  <AvatarFallback>
                    <User className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-white truncate">
                    {candidate.profile.name}
                  </h3>
                  <span className="text-gray-400">@{candidate.profile.username}</span>
                  <Badge
                    variant="outline"
                    className={getRecommendationStyle(candidate.recommendation)}
                  >
                    {candidate.recommendation.toUpperCase()}
                  </Badge>
                </div>

                {candidate.profile.bio && (
                  <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                    {candidate.profile.bio}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <GitFork className="w-4 h-4" />
                    {candidate.profile.repos} repos
                  </span>
                  <span className="flex items-center gap-1">
                    <UsersIcon className="w-4 h-4" />
                    {candidate.profile.followers} followers
                  </span>
                  {candidate.profile.location && (
                    <span className="text-gray-500">{candidate.profile.location}</span>
                  )}
                </div>

                <div className="space-y-2">
                  {candidate.matchingSkills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <div className="flex flex-wrap gap-1">
                        {candidate.matchingSkills.slice(0, 5).map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="bg-green-500/20 text-green-400 border-green-500/30 text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {candidate.matchingSkills.length > 5 && (
                          <span className="text-green-400 text-xs">
                            +{candidate.matchingSkills.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {candidate.missingSkills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1">
                      <XCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />
                      <div className="flex flex-wrap gap-1">
                        {candidate.missingSkills.slice(0, 3).map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {candidate.missingSkills.length > 3 && (
                          <span className="text-orange-400 text-xs">
                            +{candidate.missingSkills.length - 3} gaps
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center md:border-l md:border-white/10 md:pl-6 min-w-[120px]">
              <div className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                {candidate.matchScore}%
              </div>
              <div className="text-sm text-gray-400">Match Score</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-sm text-gray-300">{candidate.reasoning}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
