import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { CodeDNA } from "@shared/schema";
import { 
  MessageSquare, 
  FileText, 
  GitCommit, 
  Users, 
  Star, 
  Eye, 
  Code, 
  TestTube, 
  Layers,
  TrendingUp,
  Sparkles
} from "lucide-react";

interface CodeDNACardProps {
  dna: CodeDNA;
}

const traitColors: Record<string, string> = {
  Concise: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Detailed: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Visual: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  Extensive: "bg-green-500/20 text-green-400 border-green-500/30",
  Moderate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Minimal: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  Atomic: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "Feature-based": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Mixed: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  Mentor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Contributor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Solo Builder": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Architect: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  "Active Reviewer": "bg-green-500/20 text-green-400 border-green-500/30",
  Occasional: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Rare: "bg-red-500/20 text-red-400 border-red-500/30",
  Functional: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  OOP: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  Hybrid: "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30",
  "TDD Advocate": "bg-green-500/20 text-green-400 border-green-500/30",
  Pragmatic: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Microservices: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  Monolithic: "bg-stone-500/20 text-stone-400 border-stone-500/30",
  Modular: "bg-lime-500/20 text-lime-400 border-lime-500/30",
  Increasing: "bg-green-500/20 text-green-400 border-green-500/30",
  Stable: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Exploring: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

function TraitBadge({ value }: { value: string }) {
  const colorClass = traitColors[value] || "bg-white/10 text-white/80 border-white/20";
  return (
    <Badge variant="outline" className={`${colorClass} border`} data-testid={`badge-trait-${value.toLowerCase().replace(/\s+/g, '-')}`}>
      {value}
    </Badge>
  );
}

function TraitRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 py-2">
      <div className="flex items-center gap-2 text-white/70">
        <Icon className="w-4 h-4" />
        <span className="text-sm">{label}</span>
      </div>
      <TraitBadge value={value} />
    </div>
  );
}

export default function CodeDNACard({ dna }: CodeDNACardProps) {
  return (
    <Card className="bg-white/5 border-amber-500/20" data-testid="card-code-dna">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-400">
          <Sparkles className="w-5 h-5" />
          Code DNA Fingerprint
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-white/90 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            Personality Profile
          </h3>
          <div className="bg-white/5 rounded-md p-3 space-y-1">
            <TraitRow icon={MessageSquare} label="Communication" value={dna.personality.communicationStyle} />
            <TraitRow icon={FileText} label="Documentation" value={dna.personality.documentationHabits} />
            <TraitRow icon={GitCommit} label="Commit Style" value={dna.personality.commitStyle} />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-white/90 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            Collaboration Style
          </h3>
          <div className="bg-white/5 rounded-md p-3 space-y-3">
            <TraitRow icon={Users} label="Role" value={dna.collaboration.role} />
            <TraitRow icon={Eye} label="Review Activity" value={dna.collaboration.reviewActivity} />
            <div className="flex items-center justify-between gap-2 py-2">
              <div className="flex items-center gap-2 text-white/70">
                <Star className="w-4 h-4" />
                <span className="text-sm">PR Quality</span>
              </div>
              <div className="flex items-center gap-2 w-32">
                <Progress value={dna.collaboration.prQuality} className="h-2" />
                <span className="text-sm text-white/70 w-8">{dna.collaboration.prQuality}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-white/90 flex items-center gap-2">
            <Code className="w-4 h-4 text-amber-400" />
            Technical DNA
          </h3>
          <div className="bg-white/5 rounded-md p-3 space-y-1">
            <TraitRow icon={Code} label="Code Structure" value={dna.technicalDNA.codeStructure} />
            <TraitRow icon={TestTube} label="Testing Approach" value={dna.technicalDNA.testingApproach} />
            <TraitRow icon={Layers} label="Architecture" value={dna.technicalDNA.architecturePreference} />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-white/90 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            Evolution & Growth
          </h3>
          <div className="bg-white/5 rounded-md p-3 space-y-3">
            <div className="flex items-center justify-between gap-2 py-2">
              <span className="text-sm text-white/70">Primary Focus</span>
              <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                {dna.evolution.primaryGrowthArea}
              </Badge>
            </div>
            <TraitRow icon={TrendingUp} label="Complexity Trend" value={dna.evolution.complexityTrend} />
            
            {dna.evolution.languageProgression.length > 0 && (
              <div className="pt-2 space-y-2">
                <span className="text-sm text-white/70">Language Timeline</span>
                <div className="space-y-2">
                  {dna.evolution.languageProgression.map((entry) => (
                    <div key={entry.year} className="flex items-center gap-3">
                      <span className="text-xs text-white/50 w-10">{entry.year}</span>
                      <div className="flex flex-wrap gap-1">
                        {entry.languages.map((lang) => (
                          <Badge 
                            key={`${entry.year}-${lang}`} 
                            variant="outline" 
                            className="text-xs bg-white/5 text-white/70 border-white/10"
                          >
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {dna.uniqueMarkers.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white/90 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Unique Markers
            </h3>
            <div className="flex flex-wrap gap-2">
              {dna.uniqueMarkers.map((marker) => (
                <Badge 
                  key={marker} 
                  className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30"
                  data-testid={`badge-marker-${marker.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {marker}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
