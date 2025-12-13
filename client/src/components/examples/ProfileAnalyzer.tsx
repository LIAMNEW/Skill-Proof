import { useState } from "react";
import ProfileAnalyzer from '../ProfileAnalyzer';

export default function ProfileAnalyzerExample() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const handleAnalyze = (username: string) => {
    console.log('Analyzing profile:', username);
    setIsLoading(true);
    
    const messages = ["Fetching profile...", "Analyzing repositories...", "Extracting skills..."];
    let i = 0;
    setLoadingMessage(messages[0]);
    
    const interval = setInterval(() => {
      i++;
      if (i < messages.length) {
        setLoadingMessage(messages[i]);
      } else {
        clearInterval(interval);
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <ProfileAnalyzer 
      onAnalyze={handleAnalyze} 
      isLoading={isLoading} 
      loadingMessage={loadingMessage} 
    />
  );
}
