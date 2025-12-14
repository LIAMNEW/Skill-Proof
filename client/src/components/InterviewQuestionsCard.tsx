import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircleQuestion, CircleHelp, Lightbulb, Target } from "lucide-react";

interface InterviewQuestion {
  skill: string;
  question: string;
  difficulty: "easy" | "medium" | "hard";
  category: "conceptual" | "practical" | "scenario";
  followUp?: string;
}

interface InterviewQuestionsCardProps {
  questions: InterviewQuestion[];
}

const difficultyColors: Record<string, string> = {
  easy: "bg-green-500/20 text-green-400 border-green-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  hard: "bg-red-500/20 text-red-400 border-red-500/30",
};

const categoryIcons: Record<string, React.ElementType> = {
  conceptual: CircleHelp,
  practical: Lightbulb,
  scenario: Target,
};

const categoryLabels: Record<string, string> = {
  conceptual: "Conceptual",
  practical: "Practical",
  scenario: "Scenario",
};

export default function InterviewQuestionsCard({ questions }: InterviewQuestionsCardProps) {
  const groupedBySkill = questions.reduce((acc, q) => {
    if (!acc[q.skill]) {
      acc[q.skill] = [];
    }
    acc[q.skill].push(q);
    return acc;
  }, {} as Record<string, InterviewQuestion[]>);

  return (
    <Card className="bg-white/5 border-amber-500/20" data-testid="card-interview-questions">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-400">
          <MessageCircleQuestion className="w-5 h-5" />
          Interview Questions
        </CardTitle>
        <p className="text-sm text-white/60">
          Targeted questions to probe skill gaps identified in the job match
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedBySkill).map(([skill, skillQuestions]) => (
          <div key={skill} className="space-y-3">
            <h3 className="text-sm font-medium text-white/90 flex items-center gap-2">
              <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                {skill}
              </Badge>
              <span className="text-white/50 text-xs">({skillQuestions.length} questions)</span>
            </h3>
            <div className="space-y-3">
              {skillQuestions.map((q, index) => {
                const CategoryIcon = categoryIcons[q.category] || CircleHelp;
                return (
                  <div 
                    key={`${skill}-${index}`} 
                    className="bg-white/5 rounded-md p-4 space-y-3"
                    data-testid={`question-${skill.toLowerCase().replace(/\s+/g, '-')}-${index}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-white/90 text-sm flex-1">{q.question}</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge 
                          variant="outline" 
                          className={`${difficultyColors[q.difficulty]} border text-xs`}
                        >
                          {q.difficulty}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className="bg-white/10 text-white/70 border-white/20 text-xs flex items-center gap-1"
                        >
                          <CategoryIcon className="w-3 h-3" />
                          {categoryLabels[q.category]}
                        </Badge>
                      </div>
                    </div>
                    {q.followUp && (
                      <div className="pt-2 border-t border-white/10">
                        <p className="text-xs text-white/50 mb-1">Follow-up:</p>
                        <p className="text-sm text-white/70">{q.followUp}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
