import { useState } from "react";
import ProfileAnalyzer from '../ProfileAnalyzer';

export default function ProfileAnalyzerExample() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const handleAnalyse = (username: string) => {
    console.log('Analysing profile:', username);
    setIsLoading(true);
    
    const messages = ["Fetching profile...", "Analysing repositories...", "Extracting skills..."];
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
      onAnalyze={handleAnalyse} 
      isLoading={isLoading} 
      loadingMessage={loadingMessage} 
    />
  );
}
