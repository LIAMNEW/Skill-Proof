import ExperienceSummary from '../ExperienceSummary';

// todo: remove mock functionality
export default function ExperienceSummaryExample() {
  return (
    <ExperienceSummary
      summary="Senior frontend developer with deep expertise in React ecosystem. Core contributor to major open-source projects with demonstrated ability to build scalable, maintainable applications. Strong focus on developer experience and tooling."
      strengths={[
        "Expert-level React and JavaScript proficiency",
        "Strong open-source contribution track record",
        "Deep understanding of state management patterns"
      ]}
      notableProjects={["Redux", "Create React App", "react-hot-loader"]}
    />
  );
}
