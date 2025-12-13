import { Github } from "lucide-react";

export default function Header() {
  return (
    <header className="text-center py-12 px-4" data-testid="header">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20">
          <Github className="w-8 h-8 text-purple-400" />
        </div>
        <h1 
          className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
          data-testid="text-app-title"
        >
          SkillProof
        </h1>
      </div>
      <p className="text-gray-300 text-lg max-w-md mx-auto" data-testid="text-tagline">
        Real skills from real code. No more credential inflation.
      </p>
    </header>
  );
}
