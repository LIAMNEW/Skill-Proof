import { Briefcase, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface JobMatcherProps {
  onMatch: (jobDescription: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export default function JobMatcher({ onMatch, isLoading = false, disabled = false }: JobMatcherProps) {
  const [jobDescription, setJobDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobDescription.trim()) {
      onMatch(jobDescription.trim());
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6" data-testid="job-matcher">
      <div className="flex items-center gap-2 mb-4">
        <Briefcase className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Match to Job Description</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="Paste job description here...

Example:
We're looking for a Senior Frontend Engineer with 5+ years of experience in React, TypeScript, and modern web development practices. Experience with GraphQL and testing frameworks preferred."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="min-h-[150px] bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus-visible:ring-purple-400 resize-none"
          disabled={isLoading || disabled}
          data-testid="input-job-description"
        />
        <Button 
          type="submit"
          disabled={isLoading || disabled || !jobDescription.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          data-testid="button-calculate-match"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Calculating Match...
            </>
          ) : (
            "Calculate Match Score"
          )}
        </Button>
      </form>
    </div>
  );
}
