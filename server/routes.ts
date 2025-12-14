import type { Express } from "express";
import { type Server } from "http";
import { 
  analyzeGitHubProfile, 
  matchProfileToJob, 
  batchCompareProfiles,
  searchGitHubUsers 
} from "./github-service";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/analyze-github", async (req, res) => {
    try {
      const { username } = req.body;
      
      if (!username) {
        return res.status(400).json({ error: "Username is required" });
      }

      const profileData = await analyzeGitHubProfile(username);
      res.json(profileData);
    } catch (error: any) {
      console.error("GitHub analysis error:", error);
      
      if (error.response?.status === 404) {
        return res.status(404).json({ error: `GitHub user '${req.body.username}' not found` });
      }
      if (error.response?.status === 403) {
        return res.status(429).json({ error: "GitHub API rate limit exceeded. Please try again later." });
      }
      
      res.status(500).json({ error: error.message || "Failed to analyze profile" });
    }
  });

  app.post("/api/match-job", async (req, res) => {
    try {
      const { profile, jobDescription } = req.body;
      
      if (!profile || !jobDescription) {
        return res.status(400).json({ error: "Profile and job description are required" });
      }

      const matchResult = await matchProfileToJob(profile, jobDescription);
      res.json(matchResult);
    } catch (error: any) {
      console.error("Job matching error:", error);
      res.status(500).json({ error: error.message || "Failed to calculate match" });
    }
  });

  app.post("/api/batch-compare", async (req, res) => {
    try {
      const { usernames, jobDescription } = req.body;
      
      if (!usernames || !Array.isArray(usernames) || usernames.length === 0) {
        return res.status(400).json({ error: "At least one username is required" });
      }
      
      if (usernames.length > 10) {
        return res.status(400).json({ error: "Maximum 10 candidates allowed per comparison" });
      }
      
      if (!jobDescription) {
        return res.status(400).json({ error: "Job description is required" });
      }

      const rankings = await batchCompareProfiles(usernames, jobDescription);
      res.json({ rankings, total: rankings.length });
    } catch (error: any) {
      console.error("Batch comparison error:", error);
      
      if (error.response?.status === 403) {
        return res.status(429).json({ error: "GitHub API rate limit exceeded. Please try again later." });
      }
      
      res.status(500).json({ error: error.message || "Failed to compare candidates" });
    }
  });

  app.post("/api/search-candidates", async (req, res) => {
    try {
      const { skills, location, minRepos, minFollowers } = req.body;
      
      const results = await searchGitHubUsers({
        skills,
        location,
        minRepos,
        minFollowers,
      });
      
      res.json({ candidates: results, total: results.length });
    } catch (error: any) {
      console.error("Candidate search error:", error);
      
      if (error.response?.status === 403) {
        return res.status(429).json({ error: "GitHub API rate limit exceeded. Please try again later." });
      }
      
      res.status(500).json({ error: error.message || "Failed to search candidates" });
    }
  });

  return httpServer;
}
