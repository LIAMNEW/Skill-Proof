import { Award, ShieldCheck, Clock, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SkillVerificationScore {
  score: number;
  frequency: number;
  recencyBonus: number;
  complexityBonus: number;
}

interface SkillsGridProps {
  skills: string[];
  proficiencyLevels: Record<string, string>;
  verificationScores?: Record<string, SkillVerificationScore>;
}

const proficiencyColors: Record<string, string> = {
  expert: "bg-green-500/20 text-green-400 border-green-500/30",
  intermediate: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  beginner: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

function getVerificationColor(score: number): string {
  if (score >= 70) return "text-green-400";
  if (score >= 40) return "text-amber-400";
  return "text-gray-400";
}

function getVerificationLabel(score: number): string {
  if (score >= 70) return "High confidence";
  if (score >= 40) return "Moderate confidence";
  return "Low evidence";
}

export default function SkillsGrid({ skills, proficiencyLevels, verificationScores }: SkillsGridProps) {
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-amber-500/20 rounded-2xl p-6" data-testid="skills-grid">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-amber-400" />
        <h3 className="text-lg font-semibold text-white">Technical Skills</h3>
        {verificationScores && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="ml-auto flex items-center gap-1 text-xs text-white/50 cursor-help">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-xs">Verification scores are calculated from code frequency, recent activity, and project complexity</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        {skills.map((skill, index) => {
          const level = proficiencyLevels[skill]?.toLowerCase() || "intermediate";
          const verification = verificationScores?.[skill];
          
          return (
            <Tooltip key={skill}>
              <TooltipTrigger asChild>
                <div 
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${proficiencyColors[level] || proficiencyColors.intermediate} cursor-default`}
                  data-testid={`skill-badge-${index}`}
                >
                  <span className="text-sm font-medium">{skill}</span>
                  <Badge 
                    variant="secondary" 
                    className="text-xs capitalize bg-transparent border-0 px-0"
                  >
                    {level}
                  </Badge>
                  {verification && (
                    <div className={`flex items-center gap-1 ${getVerificationColor(verification.score)}`}>
                      <ShieldCheck className="w-3 h-3" />
                      <span className="text-xs font-medium">{verification.score}</span>
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              {verification && (
                <TooltipContent side="top" className="max-w-xs">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{getVerificationLabel(verification.score)}</p>
                    <div className="flex items-center gap-2 text-xs text-white/70">
                      <span className="flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        {verification.frequency} repos
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        +{verification.recencyBonus} recency
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        +{verification.complexityBonus} complexity
                      </span>
                    </div>
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
