import SkillsGrid from '../SkillsGrid';

// todo: remove mock functionality
const mockSkills = ["React", "TypeScript", "Node.js", "Python", "GraphQL", "Docker", "AWS", "PostgreSQL", "Git"];
const mockProficiencyLevels: Record<string, string> = {
  "React": "expert",
  "TypeScript": "expert",
  "Node.js": "expert",
  "Python": "intermediate",
  "GraphQL": "intermediate",
  "Docker": "intermediate",
  "AWS": "beginner",
  "PostgreSQL": "intermediate",
  "Git": "expert"
};

export default function SkillsGridExample() {
  return <SkillsGrid skills={mockSkills} proficiencyLevels={mockProficiencyLevels} />;
}
