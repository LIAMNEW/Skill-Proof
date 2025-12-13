import { useState } from "react";
import JobMatcher from '../JobMatcher';

export default function JobMatcherExample() {
  const [isLoading, setIsLoading] = useState(false);

  const handleMatch = (jobDescription: string) => {
    console.log('Matching job description:', jobDescription.substring(0, 50) + '...');
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return <JobMatcher onMatch={handleMatch} isLoading={isLoading} />;
}
