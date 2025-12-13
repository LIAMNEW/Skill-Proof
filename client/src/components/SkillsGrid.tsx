import { Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SkillsGridProps {
  skills: string[];
  proficiencyLevels: Record<string, string>;
}

const proficiencyColors: Record<string, string> = {
  expert: "bg-green-500/20 text-green-400 border-green-500/30",
  intermediate: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  beginner: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

export default function SkillsGrid({ skills, proficiencyLevels }: SkillsGridProps) {
  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6" data-testid="skills-grid">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Technical Skills</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {skills.map((skill, index) => {
          const level = proficiencyLevels[skill]?.toLowerCase() || "intermediate";
          return (
            <div 
              key={skill}
              className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border ${proficiencyColors[level] || proficiencyColors.intermediate}`}
              data-testid={`skill-badge-${index}`}
            >
              <span className="text-sm font-medium truncate">{skill}</span>
              <Badge 
                variant="secondary" 
                className="text-xs capitalize bg-transparent border-0 px-0"
              >
                {level}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
