import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, GitFork, ExternalLink, GitPullRequest, GitCommit, MessageCircle, Plus } from "lucide-react";

interface Contribution {
  repoName: string;
  repoUrl: string;
  owner: string;
  contributions: number;
  types: string[];
  lastActivity: string;
  stars: number;
  forks: number;
  description: string | null;
  language: string | null;
}

interface OpenSourceContributionsCardProps {
  contributions: Contribution[];
  totalExternalRepos: number;
  totalContributions: number;
}

const contributionTypeIcons: Record<string, typeof GitPullRequest> = {
  PullRequestEvent: GitPullRequest,
  PushEvent: GitCommit,
  IssuesEvent: MessageCircle,
  IssueCommentEvent: MessageCircle,
  CreateEvent: Plus,
};

const contributionTypeLabels: Record<string, string> = {
  PullRequestEvent: "PRs",
  PushEvent: "Commits",
  IssuesEvent: "Issues",
  IssueCommentEvent: "Comments",
  CreateEvent: "Created",
};

export default function OpenSourceContributionsCard({
  contributions,
  totalExternalRepos,
  totalContributions,
}: OpenSourceContributionsCardProps) {
  if (contributions.length === 0) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <GitPullRequest className="w-5 h-5 text-amber-400" />
            Open Source Contributions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/60 text-center py-4">
            No recent contributions to external repositories found.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatStars = (stars: number): string => {
    if (stars >= 1000) {
      return `${(stars / 1000).toFixed(1)}k`;
    }
    return stars.toString();
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <GitPullRequest className="w-5 h-5 text-amber-400" />
            Open Source Contributions
          </CardTitle>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
              {totalExternalRepos} repos
            </Badge>
            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
              {totalContributions} contributions
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contributions.map((contrib) => (
            <div
              key={contrib.repoName}
              className="p-4 rounded-md bg-white/5 border border-white/10"
              data-testid={`contribution-${contrib.repoName.replace(/\//g, '-')}`}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={contrib.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 font-medium hover:underline flex items-center gap-1"
                      data-testid={`link-repo-${contrib.repoName.replace(/\//g, '-')}`}
                    >
                      {contrib.repoName}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    {contrib.language && (
                      <Badge variant="outline" className="text-xs border-white/20 text-white/60">
                        {contrib.language}
                      </Badge>
                    )}
                  </div>
                  {contrib.description && (
                    <p className="text-white/60 text-sm mt-1 line-clamp-2">
                      {contrib.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  <span className="flex items-center gap-1" title={`${contrib.stars} stars`}>
                    <Star className="w-4 h-4 text-amber-400" />
                    {formatStars(contrib.stars)}
                  </span>
                  <span className="flex items-center gap-1" title={`${contrib.forks} forks`}>
                    <GitFork className="w-4 h-4" />
                    {contrib.forks}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="text-white/50 text-xs">Activity:</span>
                {contrib.types.map((type) => {
                  const Icon = contributionTypeIcons[type] || GitCommit;
                  const label = contributionTypeLabels[type] || type;
                  return (
                    <Badge
                      key={type}
                      variant="outline"
                      className="text-xs border-white/20 text-white/70 flex items-center gap-1"
                    >
                      <Icon className="w-3 h-3" />
                      {label}
                    </Badge>
                  );
                })}
                <span className="text-white/40 text-xs ml-auto">
                  {contrib.contributions} contribution{contrib.contributions !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
