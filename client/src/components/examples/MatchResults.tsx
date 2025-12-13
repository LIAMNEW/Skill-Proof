import MatchResults from '../MatchResults';

// todo: remove mock functionality
export default function MatchResultsExample() {
  return (
    <MatchResults
      matchScore={87}
      matchingSkills={["React", "TypeScript", "Node.js", "GraphQL", "Testing"]}
      missingSkills={["Kubernetes", "AWS Lambda"]}
      recommendation="interview"
      reasoning="Strong candidate with excellent frontend expertise matching core job requirements. Has 5+ years of React experience as evidenced by open-source contributions and project history. Minor gaps in cloud infrastructure can be addressed through onboarding. Recommend technical interview to assess system design capabilities."
      strengthsForRole={[
        "Expert-level React proficiency with production-scale experience",
        "Strong TypeScript skills demonstrated across multiple projects",
        "Active open-source contributor showing collaboration abilities"
      ]}
    />
  );
}
