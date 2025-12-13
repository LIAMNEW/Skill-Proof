import ProfileResults from '../ProfileResults';

// todo: remove mock functionality
const mockProfile = {
  username: "gaearon",
  name: "Dan Abramov",
  avatar: "https://avatars.githubusercontent.com/u/810438",
  bio: "Working on @reactjs. Co-author of Redux and Create React App.",
  repos: 250,
  followers: 85000,
  location: "London, UK",
  languages: [
    { name: "JavaScript", percentage: 55.2, color: "#f7df1e" },
    { name: "TypeScript", percentage: 30.5, color: "#3178c6" },
    { name: "CSS", percentage: 8.3, color: "#264de4" },
    { name: "HTML", percentage: 6.0, color: "#e34f26" },
  ],
  skills: ["React", "JavaScript", "TypeScript", "Redux", "Webpack", "Babel", "Node.js", "Testing", "Git"],
  proficiencyLevels: {
    "React": "expert",
    "JavaScript": "expert",
    "TypeScript": "expert",
    "Redux": "expert",
    "Webpack": "intermediate",
    "Babel": "intermediate",
    "Node.js": "intermediate",
    "Testing": "intermediate",
    "Git": "expert"
  },
  experienceSummary: "Core React team member with exceptional expertise in frontend development and state management. Prolific open-source contributor with projects used by millions of developers worldwide.",
  strengths: [
    "Deep expertise in React internals and patterns",
    "Strong track record of building developer tools",
    "Excellent technical communication skills"
  ],
  notableProjects: ["Redux", "Create React App", "react-hot-loader", "react-dnd"]
};

export default function ProfileResultsExample() {
  return <ProfileResults profile={mockProfile} />;
}
