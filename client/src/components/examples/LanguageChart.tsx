import LanguageChart from '../LanguageChart';

// todo: remove mock functionality
const mockLanguages = [
  { name: "JavaScript", percentage: 45.2, color: "#f7df1e" },
  { name: "TypeScript", percentage: 28.5, color: "#3178c6" },
  { name: "Python", percentage: 15.3, color: "#3776ab" },
  { name: "Go", percentage: 8.1, color: "#00add8" },
  { name: "Rust", percentage: 2.9, color: "#dea584" },
];

export default function LanguageChartExample() {
  return <LanguageChart languages={mockLanguages} />;
}
