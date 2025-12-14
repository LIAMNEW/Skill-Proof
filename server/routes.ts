import type { Express } from "express";
import { createServer, type Server } from "http";
import Anthropic from "@anthropic-ai/sdk";
import axios from "axios";

const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

const languageColors: Record<string, string> = {
  JavaScript: "#f7df1e",
  TypeScript: "#3178c6",
  Python: "#3776ab",
  Java: "#b07219",
  Go: "#00add8",
  Rust: "#dea584",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Ruby: "#701516",
  PHP: "#4f5d95",
  Swift: "#f05138",
  Kotlin: "#a97bff",
  Scala: "#c22d40",
  Shell: "#89e051",
  HTML: "#e34f26",
  CSS: "#264de4",
  Vue: "#41b883",
  Dart: "#00b4ab",
  Elixir: "#6e4a7e",
};

async function fetchGitHubData(username: string) {
  const userResponse = await axios.get(`https://api.github.com/users/${username}`, {
    headers: { Accept: "application/vnd.github.v3+json" },
  });
  
  const reposResponse = await axios.get(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=30`,
    { headers: { Accept: "application/vnd.github.v3+json" } }
  );

  return { user: userResponse.data, repos: reposResponse.data };
}

function calculateLanguageStats(repos: any[]) {
  const languageCounts: Record<string, number> = {};
  
  for (const repo of repos) {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + (repo.size || 1);
    }
  }

  const total = Object.values(languageCounts).reduce((a, b) => a + b, 0);
  
  return Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({
      name,
      percentage: (count / total) * 100,
      color: languageColors[name] || "#6b7280",
    }));
}

function extractJSONFromResponse(text: string): any {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1]);
  }
  
  const plainJsonMatch = text.match(/\{[\s\S]*\}/);
  if (plainJsonMatch) {
    return JSON.parse(plainJsonMatch[0]);
  }
  
  throw new Error("No valid JSON found in response");
}

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

      const { user, repos } = await fetchGitHubData(username);
      const languages = calculateLanguageStats(repos);
      
      const topRepos = repos.slice(0, 10).map((r: any) => ({
        name: r.name,
        description: r.description,
        stars: r.stargazers_count,
        forks: r.forks_count,
        language: r.language,
      }));

      const languageStats = languages.map(l => `${l.name}: ${l.percentage.toFixed(1)}%`).join(", ");

      const prompt = `Analyze this GitHub profile and extract technical skills.

User: ${user.name || username}
Bio: ${user.bio || "No bio"}
Repos: ${user.public_repos}
Followers: ${user.followers}

Top Repositories:
${JSON.stringify(topRepos, null, 2)}

Languages: ${languageStats}

Return ONLY valid JSON (no markdown):
{
  "skills": ["skill1", "skill2", "..."],
  "proficiency_levels": {"skill1": "expert", "skill2": "intermediate"},
  "strengths": ["strength1", "strength2"],
  "experience_summary": "brief 2-3 sentence summary",
  "notable_projects": ["project1", "project2"]
}`;

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      });

      let aiData;
      try {
        const textContent = response.content.find(c => c.type === "text");
        if (textContent && textContent.type === "text") {
          aiData = extractJSONFromResponse(textContent.text);
        }
      } catch (parseError) {
        aiData = {
          skills: languages.map(l => l.name),
          proficiency_levels: Object.fromEntries(languages.map(l => [l.name, "intermediate"])),
          strengths: ["Active GitHub contributor"],
          experience_summary: `Developer with ${user.public_repos} repositories and expertise in ${languages[0]?.name || "software development"}.`,
          notable_projects: topRepos.slice(0, 3).map((r: any) => r.name),
        };
      }

      const profileData = {
        username: user.login,
        name: user.name || user.login,
        avatar: user.avatar_url,
        bio: user.bio || "",
        repos: user.public_repos,
        followers: user.followers,
        location: user.location,
        languages,
        skills: aiData.skills || [],
        proficiencyLevels: aiData.proficiency_levels || {},
        experienceSummary: aiData.experience_summary || "",
        strengths: aiData.strengths || [],
        notableProjects: aiData.notable_projects || [],
      };

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

      const prompt = `Compare candidate skills to job requirements and provide a match analysis.

Candidate Skills: ${JSON.stringify(profile.skills)}
Candidate Proficiency Levels: ${JSON.stringify(profile.proficiencyLevels)}
Candidate Strengths: ${JSON.stringify(profile.strengths)}
Experience Summary: ${profile.experienceSummary}

Job Description:
${jobDescription}

Analyze how well this candidate matches the job requirements. Return ONLY valid JSON (no markdown):
{
  "match_score": 85,
  "matching_skills": ["skill1", "skill2"],
  "missing_skills": ["skill3", "skill4"],
  "strengths_for_role": ["relevant strength 1", "relevant strength 2"],
  "recommendation": "hire" or "interview" or "pass",
  "reasoning": "2-3 sentence explanation of the match analysis"
}`;

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      });

      let matchData;
      try {
        const textContent = response.content.find(c => c.type === "text");
        if (textContent && textContent.type === "text") {
          matchData = extractJSONFromResponse(textContent.text);
        }
      } catch (parseError) {
        matchData = {
          match_score: 50,
          matching_skills: profile.skills.slice(0, 3),
          missing_skills: ["Unable to parse requirements"],
          strengths_for_role: profile.strengths?.slice(0, 2) || [],
          recommendation: "interview",
          reasoning: "Analysis completed with limited parsing. Manual review recommended.",
        };
      }

      res.json({
        matchScore: matchData.match_score,
        matchingSkills: matchData.matching_skills || [],
        missingSkills: matchData.missing_skills || [],
        strengthsForRole: matchData.strengths_for_role || [],
        recommendation: matchData.recommendation || "interview",
        reasoning: matchData.reasoning || "",
      });
    } catch (error: any) {
      console.error("Job matching error:", error);
      res.status(500).json({ error: error.message || "Failed to calculate match" });
    }
  });

  return httpServer;
}
