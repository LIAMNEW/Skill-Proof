import ProfileCard from "./ProfileCard";
import LanguageChart from "./LanguageChart";
import SkillsGrid from "./SkillsGrid";
import ExperienceSummary from "./ExperienceSummary";

interface Language {
  name: string;
  percentage: number;
  color: string;
}

export interface SkillVerificationScore {
  score: number;
  frequency: number;
  recencyBonus: number;
  complexityBonus: number;
}

export interface ProfileData {
  username: string;
  name: string;
  avatar: string;
  bio: string;
  repos: number;
  followers: number;
  location?: string;
  languages: Language[];
  skills: string[];
  proficiencyLevels: Record<string, string>;
  skillVerificationScores?: Record<string, SkillVerificationScore>;
  experienceSummary: string;
  strengths?: string[];
  notableProjects?: string[];
}

interface ProfileResultsProps {
  profile: ProfileData;
}

export default function ProfileResults({ profile }: ProfileResultsProps) {
  return (
    <div className="space-y-6 transition-all duration-500" data-testid="profile-results">
      <ProfileCard
        username={profile.username}
        name={profile.name}
        avatar={profile.avatar}
        bio={profile.bio}
        repos={profile.repos}
        followers={profile.followers}
        location={profile.location}
      />
      
      <div className="grid md:grid-cols-2 gap-6">
        <LanguageChart languages={profile.languages} />
        <SkillsGrid 
          skills={profile.skills} 
          proficiencyLevels={profile.proficiencyLevels}
          verificationScores={profile.skillVerificationScores}
        />
      </div>
      
      <ExperienceSummary 
        summary={profile.experienceSummary}
        strengths={profile.strengths}
        notableProjects={profile.notableProjects}
      />
    </div>
  );
}
