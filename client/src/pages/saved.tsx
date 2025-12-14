import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Trash2, Eye, Calendar, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import ProfileResults, { type ProfileData } from "@/components/ProfileResults";
import MatchResults from "@/components/MatchResults";

interface MatchData {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  recommendation: "hire" | "interview" | "pass";
  reasoning: string;
  strengthsForRole?: string[];
}

interface SavedAnalysis {
  id: number;
  username: string;
  profileData: ProfileData;
  matchData: MatchData | null;
  jobDescription: string | null;
  createdAt: string;
}

export default function SavedAnalyses() {
  const [, setLocation] = useLocation();
  const [selectedAnalysis, setSelectedAnalysis] = useState<SavedAnalysis | null>(null);
  const { toast } = useToast();

  const { data: analyses, isLoading } = useQuery<SavedAnalysis[]>({
    queryKey: ["/api/analyses"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/analyses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analyses"] });
      toast({
        title: "Analysis deleted",
        description: "The saved analysis has been removed.",
      });
      if (selectedAnalysis) {
        setSelectedAnalysis(null);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case "hire":
        return "bg-green-500/20 text-green-400";
      case "interview":
        return "bg-amber-500/20 text-amber-400";
      case "pass":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-white/10 text-white/60";
    }
  };

  if (selectedAnalysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#1a1a24]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => setSelectedAnalysis(null)}
            className="mb-6 text-white/70"
            data-testid="button-back-to-list"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Saved Analyses
          </Button>

          <div className="mb-4 text-white/50 text-sm">
            Saved on {formatDate(selectedAnalysis.createdAt)}
          </div>

          <ProfileResults profile={selectedAnalysis.profileData} />

          {selectedAnalysis.matchData && (
            <div className="mt-8">
              {selectedAnalysis.jobDescription && (
                <Card className="mb-6 bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Job Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/70 whitespace-pre-wrap">
                      {selectedAnalysis.jobDescription}
                    </p>
                  </CardContent>
                </Card>
              )}
              <MatchResults
                matchScore={selectedAnalysis.matchData.matchScore}
                matchingSkills={selectedAnalysis.matchData.matchingSkills}
                missingSkills={selectedAnalysis.matchData.missingSkills}
                recommendation={selectedAnalysis.matchData.recommendation}
                reasoning={selectedAnalysis.matchData.reasoning}
                strengthsForRole={selectedAnalysis.matchData.strengthsForRole}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#1a1a24]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/">
              <Button variant="ghost" className="mb-2 text-white/70" data-testid="link-back-home">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-white">Saved Analyses</h1>
            <p className="text-white/60 mt-1">View and manage your saved candidate analyses</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full" />
          </div>
        ) : !analyses || analyses.length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="py-16 text-center">
              <p className="text-white/60 text-lg">No saved analyses yet</p>
              <p className="text-white/40 mt-2">
                Analyze a GitHub profile and save it to see it here
              </p>
              <Link href="/">
                <Button className="mt-4 bg-amber-500 text-black" data-testid="link-analyze-profile">
                  Analyze a Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {analyses.map((analysis) => (
              <Card
                key={analysis.id}
                className="bg-white/5 border-white/10 hover-elevate cursor-pointer"
                data-testid={`card-analysis-${analysis.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={analysis.profileData.avatar}
                      alt={analysis.username}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-white">
                          {analysis.profileData.name || analysis.username}
                        </h3>
                        <span className="text-white/50">@{analysis.username}</span>
                        {analysis.matchData && (
                          <Badge className={getRecommendationColor(analysis.matchData.recommendation)}>
                            {analysis.matchData.recommendation.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-white/50">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(analysis.createdAt)}
                        </span>
                        {analysis.matchData && (
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {analysis.matchData.matchScore}% match
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {analysis.profileData.skills.slice(0, 5).map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="text-xs bg-white/10 text-white/70"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {analysis.profileData.skills.length > 5 && (
                          <Badge variant="secondary" className="text-xs bg-white/10 text-white/50">
                            +{analysis.profileData.skills.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setSelectedAnalysis(analysis)}
                        className="text-white/60"
                        data-testid={`button-view-analysis-${analysis.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(analysis.id);
                        }}
                        disabled={deleteMutation.isPending}
                        className="text-red-400/60"
                        data-testid={`button-delete-analysis-${analysis.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
