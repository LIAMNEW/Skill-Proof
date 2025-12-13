import { Code } from "lucide-react";

interface Language {
  name: string;
  percentage: number;
  color: string;
}

interface LanguageChartProps {
  languages: Language[];
}

export default function LanguageChart({ languages }: LanguageChartProps) {
  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6" data-testid="language-chart">
      <div className="flex items-center gap-2 mb-4">
        <Code className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Language Distribution</h3>
      </div>
      <div className="space-y-3">
        {languages.map((lang, index) => (
          <div key={lang.name} data-testid={`language-bar-${index}`}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300">{lang.name}</span>
              <span className="text-gray-400">{lang.percentage.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ 
                  width: `${lang.percentage}%`,
                  backgroundColor: lang.color
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
