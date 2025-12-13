import { TrendingUp, Star } from "lucide-react";

interface ExperienceSummaryProps {
  summary: string;
  notableProjects?: string[];
  strengths?: string[];
}

export default function ExperienceSummary({ summary, notableProjects, strengths }: ExperienceSummaryProps) {
  return (
    <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 backdrop-blur-lg border border-amber-500/30 rounded-2xl p-6" data-testid="experience-summary">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-amber-400" />
        <h3 className="text-lg font-semibold text-white">AI Experience Analysis</h3>
      </div>
      <p className="text-gray-300 mb-4" data-testid="text-experience-summary">{summary}</p>
      
      {strengths && strengths.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-amber-300 mb-2 flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-400" /> Key Strengths
          </h4>
          <ul className="space-y-1">
            {strengths.map((strength, i) => (
              <li key={i} className="text-gray-400 text-sm flex items-start gap-2">
                <span className="text-amber-400 mt-1">-</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {notableProjects && notableProjects.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-amber-300 mb-2">Notable Projects</h4>
          <div className="flex flex-wrap gap-2">
            {notableProjects.map((project, i) => (
              <span 
                key={i}
                className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs rounded-md border border-amber-500/30"
              >
                {project}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
