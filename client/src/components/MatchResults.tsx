import { CheckCircle, XCircle, Target, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MatchResultsProps {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  recommendation: "hire" | "interview" | "pass";
  reasoning: string;
  strengthsForRole?: string[];
}

const recommendationStyles: Record<string, { bg: string; text: string; label: string }> = {
  hire: { bg: "bg-green-500/20", text: "text-green-400", label: "STRONG HIRE" },
  interview: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "INTERVIEW" },
  pass: { bg: "bg-red-500/20", text: "text-red-400", label: "PASS" },
};

export default function MatchResults({ 
  matchScore, 
  matchingSkills, 
  missingSkills, 
  recommendation, 
  reasoning,
  strengthsForRole 
}: MatchResultsProps) {
  const recStyle = recommendationStyles[recommendation] || recommendationStyles.interview;

  return (
    <div className="space-y-6" data-testid="match-results">
      <div className="bg-white/5 backdrop-blur-lg border border-amber-500/20 rounded-2xl p-8 text-center">
        <div className="mb-4">
          <span 
            className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent"
            data-testid="text-match-score"
          >
            {matchScore}%
          </span>
        </div>
        <p className="text-gray-400 mb-4">Match Score</p>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${recStyle.bg} border border-current/20`}>
          <Target className={`w-4 h-4 ${recStyle.text}`} />
          <span className={`font-semibold ${recStyle.text}`} data-testid="text-recommendation">
            {recStyle.label}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white/5 backdrop-blur-lg border border-amber-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <h4 className="font-semibold text-white">Matching Skills</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {matchingSkills.map((skill, i) => (
              <Badge 
                key={i}
                className="bg-green-500/20 text-green-400 border border-green-500/30"
                data-testid={`badge-matching-skill-${i}`}
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg border border-amber-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5 text-orange-400" />
            <h4 className="font-semibold text-white">Missing Skills</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {missingSkills.length > 0 ? (
              missingSkills.map((skill, i) => (
                <Badge 
                  key={i}
                  className="bg-orange-500/20 text-orange-400 border border-orange-500/30"
                  data-testid={`badge-missing-skill-${i}`}
                >
                  {skill}
                </Badge>
              ))
            ) : (
              <span className="text-gray-500 text-sm">No critical skills missing</span>
            )}
          </div>
        </div>
      </div>

      {strengthsForRole && strengthsForRole.length > 0 && (
        <div className="bg-white/5 backdrop-blur-lg border border-amber-500/20 rounded-2xl p-6">
          <h4 className="font-semibold text-white mb-3">Strengths for This Role</h4>
          <ul className="space-y-2">
            {strengthsForRole.map((strength, i) => (
              <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 backdrop-blur-lg border border-amber-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-5 h-5 text-amber-400" />
          <h4 className="font-semibold text-white">AI Analysis</h4>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed" data-testid="text-match-reasoning">
          {reasoning}
        </p>
      </div>
    </div>
  );
}
