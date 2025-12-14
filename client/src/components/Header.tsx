import { Link } from "wouter";
import { Github, Users, UserSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="text-center py-12 px-4" data-testid="header">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-lg border border-amber-500/20">
          <Github className="w-8 h-8 text-amber-400" />
        </div>
        <h1 
          className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent"
          data-testid="text-app-title"
        >
          SkillProof
        </h1>
      </div>
      <p className="text-gray-300 text-lg max-w-md mx-auto mb-6" data-testid="text-tagline">
        Real skills from real code. No more credential inflation.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/compare">
          <Button variant="outline" className="border-amber-500/30 text-amber-400" data-testid="button-compare-page">
            <Users className="w-4 h-4 mr-2" />
            Compare Candidates
          </Button>
        </Link>
        <Link href="/search">
          <Button variant="outline" className="border-amber-500/30 text-amber-400" data-testid="button-search-page">
            <UserSearch className="w-4 h-4 mr-2" />
            Discover Talent
          </Button>
        </Link>
      </div>
    </header>
  );
}
