import type { Express } from "express";
import { createServer, type Server } from "http";
import Anthropic from "@anthropic-ai/sdk";
import axios from "axios";
import PDFDocument from "pdfkit";
import { storage } from "./storage";
import { insertSavedAnalysisSchema, type CodeDNA } from "@shared/schema";

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

interface ProfileData {
  username: string;
  name: string;
  avatar: string;
  bio: string;
  repos: number;
  followers: number;
  location?: string;
  languages: { name: string; percentage: number; color: string }[];
  skills: string[];
  proficiencyLevels: Record<string, string>;
  experienceSummary: string;
  strengths: string[];
  notableProjects: string[];
}

interface MatchData {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  strengthsForRole: string[];
  recommendation: "hire" | "interview" | "pass";
  reasoning: string;
}

interface CandidateRanking extends ProfileData {
  matchData: MatchData;
  rank: number;
}

let rateLimitRemaining = 60;
let rateLimitReset = 0;

const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const githubCache = new Map<string, CacheEntry<{ user: any; repos: any[] }>>();
const profileCache = new Map<string, CacheEntry<ProfileData>>();
const codeDnaCache = new Map<string, CacheEntry<CodeDNA>>();

function isCacheValid<T>(entry: CacheEntry<T> | undefined): entry is CacheEntry<T> {
  return entry !== undefined && (Date.now() - entry.timestamp) < CACHE_TTL;
}

function getCacheStats() {
  return {
    githubCacheSize: githubCache.size,
    profileCacheSize: profileCache.size,
    cacheTTL: CACHE_TTL / 60000 + " minutes"
  };
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getGitHubHeaders() {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

async function fetchGitHubData(username: string) {
  const cacheKey = username.toLowerCase();
  const cached = githubCache.get(cacheKey);
  
  if (isCacheValid(cached)) {
    console.log(`Cache hit for GitHub data: ${username}`);
    return cached.data;
  }

  if (rateLimitRemaining <= 2 && Date.now() < rateLimitReset) {
    const waitTime = rateLimitReset - Date.now();
    throw new Error(`Rate limit exceeded. Resets in ${Math.ceil(waitTime / 60000)} minutes.`);
  }

  const headers = getGitHubHeaders();
  console.log(`Fetching GitHub data for: ${username} (authenticated: ${!!process.env.GITHUB_TOKEN})`);
  
  const userResponse = await axios.get(`https://api.github.com/users/${username}`, { headers });
  
  rateLimitRemaining = parseInt(userResponse.headers['x-ratelimit-remaining'] || '60');
  rateLimitReset = parseInt(userResponse.headers['x-ratelimit-reset'] || '0') * 1000;
  console.log(`GitHub API rate limit remaining: ${rateLimitRemaining}`);
  
  const reposResponse = await axios.get(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=30`,
    { headers }
  );
  
  rateLimitRemaining = parseInt(reposResponse.headers['x-ratelimit-remaining'] || '60');

  const result = { user: userResponse.data, repos: reposResponse.data };
  githubCache.set(cacheKey, { data: result, timestamp: Date.now() });
  
  return result;
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

const SKILL_ANALYSIS_SYSTEM_PROMPT = `You are a technical recruiter AI that analyzes GitHub profiles to extract skills and experience. 

Your task is to:
1. Identify technical skills from repository languages, descriptions, and project types
2. Categorize proficiency levels based on evidence (expert: many repos/stars, intermediate: some repos, beginner: few repos)
3. Identify strengths based on project complexity and contributions
4. Write concise, professional summaries

Skill categories to consider:
- Programming Languages (JavaScript, Python, Go, Rust, etc.)
- Frameworks (React, Vue, Django, Express, etc.)
- Databases (PostgreSQL, MongoDB, Redis, etc.)
- Cloud/DevOps (AWS, Docker, Kubernetes, CI/CD)
- Specializations (Machine Learning, Mobile Dev, Game Dev, etc.)

Always return valid JSON without markdown formatting.`;

const SKILL_ANALYSIS_FEW_SHOT = `Example input:
User: Jane Developer
Repos: 45, Followers: 230
Languages: TypeScript 60%, Python 25%, Go 15%
Top repos: "react-dashboard" (React, 120 stars), "ml-pipeline" (Python, 85 stars), "api-gateway" (Go, 45 stars)

Example output:
{
  "skills": ["TypeScript", "React", "Python", "Machine Learning", "Go", "REST APIs", "PostgreSQL", "Docker"],
  "proficiency_levels": {"TypeScript": "expert", "React": "expert", "Python": "advanced", "Machine Learning": "intermediate", "Go": "intermediate"},
  "strengths": ["Full-stack web development", "Data pipeline architecture", "API design"],
  "experience_summary": "Experienced full-stack developer with strong TypeScript/React expertise and growing ML capabilities. Active open source contributor with 45 repositories and 230 followers.",
  "notable_projects": ["react-dashboard", "ml-pipeline", "api-gateway"]
}`;

async function analyzeGitHubProfile(username: string): Promise<ProfileData> {
  const cacheKey = username.toLowerCase();
  const cachedProfile = profileCache.get(cacheKey);
  
  if (isCacheValid(cachedProfile)) {
    console.log(`Cache hit for profile: ${username}`);
    return cachedProfile.data;
  }

  const { user, repos } = await fetchGitHubData(username);
  const languages = calculateLanguageStats(repos);
  
  const topRepos = repos.slice(0, 10).map((r: any) => ({
    name: r.name,
    description: r.description,
    stars: r.stargazers_count,
    forks: r.forks_count,
    language: r.language,
    updatedAt: r.updated_at,
  }));

  const languageStats = languages.map(l => `${l.name}: ${l.percentage.toFixed(1)}%`).join(", ");
  
  const recentActivity = repos.filter((r: any) => {
    const updatedDate = new Date(r.updated_at);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return updatedDate > sixMonthsAgo;
  }).length;

  const prompt = `Analyze this GitHub profile and extract technical skills.

User: ${user.name || username}
Bio: ${user.bio || "No bio provided"}
Public Repos: ${user.public_repos}
Followers: ${user.followers}
Recently Active Repos (last 6 months): ${recentActivity}

Top Repositories:
${JSON.stringify(topRepos, null, 2)}

Languages: ${languageStats}

${SKILL_ANALYSIS_FEW_SHOT}

Now analyze the profile above and return ONLY valid JSON:
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
    system: SKILL_ANALYSIS_SYSTEM_PROMPT,
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

  const profileData: ProfileData = {
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
  
  profileCache.set(cacheKey, { data: profileData, timestamp: Date.now() });
  
  return profileData;
}

const JOB_MATCHING_SYSTEM_PROMPT = `You are a technical recruiting expert that matches candidates to job descriptions.

Your scoring criteria:
- 90-100: Perfect match - all critical skills present, strong experience
- 75-89: Strong match - most skills present, relevant experience  
- 60-74: Good match - some skills present, transferable experience
- 40-59: Partial match - few skills, would need training
- 0-39: Poor match - missing critical skills

Recommendations:
- "hire": Score 80+ with all must-have skills
- "interview": Score 60-79 or strong potential
- "pass": Score below 60 or missing critical requirements

Be specific about which skills match and which are missing. Consider skill proficiency levels.`;

const JOB_MATCHING_FEW_SHOT = `Example:
Candidate: TypeScript (expert), React (expert), Node.js (intermediate), PostgreSQL (beginner)
Job: "Senior React Developer - 5+ years React, TypeScript required, GraphQL preferred"

{
  "match_score": 82,
  "matching_skills": ["TypeScript", "React", "Node.js"],
  "missing_skills": ["GraphQL"],
  "strengths_for_role": ["Expert React developer", "Strong TypeScript foundation"],
  "recommendation": "interview",
  "reasoning": "Strong React/TypeScript match for senior role. Missing GraphQL but has solid foundation to learn quickly. Worth interviewing to assess experience level."
}`;

async function matchProfileToJob(profile: ProfileData, jobDescription: string): Promise<MatchData> {
  const prompt = `Compare this candidate to the job requirements.

CANDIDATE:
Skills: ${JSON.stringify(profile.skills)}
Proficiency Levels: ${JSON.stringify(profile.proficiencyLevels)}
Strengths: ${JSON.stringify(profile.strengths)}
Experience: ${profile.experienceSummary}

JOB DESCRIPTION:
${jobDescription}

${JOB_MATCHING_FEW_SHOT}

Now analyze this match. Return ONLY valid JSON:
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
    system: JOB_MATCHING_SYSTEM_PROMPT,
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

  return {
    matchScore: matchData.match_score,
    matchingSkills: matchData.matching_skills || [],
    missingSkills: matchData.missing_skills || [],
    strengthsForRole: matchData.strengths_for_role || [],
    recommendation: matchData.recommendation || "interview",
    reasoning: matchData.reasoning || "",
  };
}

const CODE_DNA_SYSTEM_PROMPT = `You are an expert developer profiler that analyzes GitHub activity patterns to create a "Code DNA" fingerprint. 

Analyze the provided data to determine:

1. **Personality** - Infer from commit messages and repo patterns:
   - communicationStyle: "Concise" (short commits), "Detailed" (verbose descriptions), or "Visual" (heavy readme/doc focus)
   - documentationHabits: "Extensive" (many READMEs, docs), "Moderate" (some docs), or "Minimal" (code-focused)
   - commitStyle: "Atomic" (small focused commits), "Feature-based" (larger feature commits), or "Mixed"

2. **Collaboration** - Infer from activity patterns:
   - role: "Mentor" (helps others, many forks), "Contributor" (contributes to many projects), "Solo Builder" (mostly own projects), or "Architect" (designs complex systems)
   - prQuality: Score 1-100 based on project complexity and activity
   - reviewActivity: "Active Reviewer", "Occasional", or "Rare"

3. **Technical DNA** - Infer from repo structures:
   - codeStructure: "Functional" (FP languages/patterns), "OOP" (class-heavy), or "Hybrid"
   - testingApproach: "TDD Advocate" (test folders visible), "Pragmatic" (some tests), or "Minimal"
   - architecturePreference: "Microservices" (many small repos), "Monolithic" (large repos), or "Modular" (balanced)

4. **Evolution** - Analyze growth over time:
   - primaryGrowthArea: Current focus area (e.g., "Cloud Infrastructure", "Machine Learning")
   - languageProgression: Track languages by year
   - complexityTrend: "Increasing" (tackling harder problems), "Stable" (consistent complexity), or "Exploring" (trying new areas)

5. **Unique Markers** - Special identifiers like: "Open Source Contributor", "Framework Author", "Documentation Champion", etc.

Return valid JSON only.`;

const CODE_DNA_FEW_SHOT = `Example output:
{
  "personality": {
    "communicationStyle": "Detailed",
    "documentationHabits": "Extensive",
    "commitStyle": "Atomic"
  },
  "collaboration": {
    "role": "Architect",
    "prQuality": 85,
    "reviewActivity": "Active Reviewer"
  },
  "technicalDNA": {
    "codeStructure": "Hybrid",
    "testingApproach": "Pragmatic",
    "architecturePreference": "Modular"
  },
  "evolution": {
    "primaryGrowthArea": "Cloud Native Development",
    "languageProgression": [
      { "year": 2021, "languages": ["JavaScript", "Python"] },
      { "year": 2022, "languages": ["TypeScript", "Python", "Go"] },
      { "year": 2023, "languages": ["TypeScript", "Rust", "Go"] }
    ],
    "complexityTrend": "Increasing"
  },
  "uniqueMarkers": ["Open Source Contributor", "Framework Author", "TypeScript Expert"]
}`;

async function fetchCommitsForRepos(username: string, repos: any[]): Promise<any[]> {
  const headers = getGitHubHeaders();
  const commitData: any[] = [];
  
  const topRepos = repos.slice(0, 5);
  
  for (const repo of topRepos) {
    try {
      const commitsResponse = await axios.get(
        `https://api.github.com/repos/${username}/${repo.name}/commits?author=${username}&per_page=10`,
        { headers }
      );
      
      rateLimitRemaining = parseInt(commitsResponse.headers['x-ratelimit-remaining'] || '60');
      
      commitData.push(...commitsResponse.data.map((c: any) => ({
        repo: repo.name,
        message: c.commit?.message?.substring(0, 200) || "",
        date: c.commit?.author?.date || "",
      })));
      
      await delay(200);
    } catch (e) {
      console.log(`Could not fetch commits for ${repo.name}`);
    }
  }
  
  return commitData;
}

function analyzeReposByYear(repos: any[]): Array<{ year: number; languages: string[] }> {
  const yearData: Record<number, Set<string>> = {};
  
  for (const repo of repos) {
    if (repo.created_at && repo.language) {
      const year = new Date(repo.created_at).getFullYear();
      if (!yearData[year]) {
        yearData[year] = new Set();
      }
      yearData[year].add(repo.language);
    }
  }
  
  return Object.entries(yearData)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .slice(-5)
    .map(([year, langs]) => ({
      year: parseInt(year),
      languages: Array.from(langs),
    }));
}

async function analyzeCodeDNA(username: string): Promise<CodeDNA> {
  const cacheKey = username.toLowerCase();
  const cached = codeDnaCache.get(cacheKey);
  
  if (isCacheValid(cached)) {
    console.log(`Cache hit for Code DNA: ${username}`);
    return cached.data;
  }
  
  const { user, repos } = await fetchGitHubData(username);
  const commits = await fetchCommitsForRepos(username, repos);
  const languageProgression = analyzeReposByYear(repos);
  
  const repoInfo = repos.slice(0, 15).map((r: any) => ({
    name: r.name,
    description: r.description || "",
    language: r.language,
    stars: r.stargazers_count,
    forks: r.forks_count,
    hasTests: r.name.includes("test") || r.description?.toLowerCase().includes("test"),
    createdAt: r.created_at,
    size: r.size,
  }));
  
  const prompt = `Analyze this GitHub developer's "Code DNA" fingerprint.

User: ${user.name || username}
Bio: ${user.bio || "No bio"}
Public Repos: ${user.public_repos}
Followers: ${user.followers}
Following: ${user.following}
Account Created: ${user.created_at}

Recent Repositories:
${JSON.stringify(repoInfo, null, 2)}

Recent Commits (sample):
${JSON.stringify(commits.slice(0, 20), null, 2)}

Language Progression Over Time:
${JSON.stringify(languageProgression, null, 2)}

${CODE_DNA_FEW_SHOT}

Now analyze this developer's Code DNA. Return ONLY valid JSON matching the structure above.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2000,
    system: CODE_DNA_SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  const topLanguages = repos.slice(0, 5).map((r: any) => r.language).filter(Boolean);
  const primaryLanguage = topLanguages[0] || "Software";
  
  const defaultDnaData = {
    personality: {
      communicationStyle: "Mixed" as const,
      documentationHabits: "Moderate" as const,
      commitStyle: "Mixed" as const,
    },
    collaboration: {
      role: "Contributor" as const,
      prQuality: 70,
      reviewActivity: "Occasional" as const,
    },
    technicalDNA: {
      codeStructure: "Hybrid" as const,
      testingApproach: "Pragmatic" as const,
      architecturePreference: "Modular" as const,
    },
    evolution: {
      primaryGrowthArea: "Software Development",
      languageProgression,
      complexityTrend: "Stable" as const,
    },
    uniqueMarkers: [`${primaryLanguage} Developer`, "Active Contributor"],
    isDefaultFallback: true,
  };

  let dnaData = defaultDnaData;
  try {
    const textContent = response.content.find(c => c.type === "text");
    if (textContent && textContent.type === "text") {
      const parsed = extractJSONFromResponse(textContent.text);
      if (parsed && parsed.personality && parsed.collaboration && parsed.technicalDNA && parsed.evolution) {
        dnaData = parsed;
      }
    }
  } catch (parseError) {
    console.log("Failed to parse Code DNA response, using defaults");
  }

  const codeDna: CodeDNA = {
    username: user.login,
    personality: dnaData.personality || defaultDnaData.personality,
    collaboration: dnaData.collaboration || defaultDnaData.collaboration,
    technicalDNA: dnaData.technicalDNA || defaultDnaData.technicalDNA,
    evolution: {
      primaryGrowthArea: dnaData.evolution?.primaryGrowthArea || "Software Development",
      languageProgression: dnaData.evolution?.languageProgression || languageProgression,
      complexityTrend: dnaData.evolution?.complexityTrend || "Stable",
    },
    uniqueMarkers: (dnaData.uniqueMarkers && dnaData.uniqueMarkers.length > 0) 
      ? dnaData.uniqueMarkers 
      : defaultDnaData.uniqueMarkers,
  };
  
  codeDnaCache.set(cacheKey, { data: codeDna, timestamp: Date.now() });
  
  return codeDna;
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

      const matchData = await matchProfileToJob(profile, jobDescription);
      res.json(matchData);
    } catch (error: any) {
      console.error("Job matching error:", error);
      res.status(500).json({ error: error.message || "Failed to calculate match" });
    }
  });

  app.get("/api/rate-limit-status", async (req, res) => {
    res.json({
      remaining: rateLimitRemaining,
      resetTime: rateLimitReset,
      resetIn: rateLimitReset > Date.now() ? Math.ceil((rateLimitReset - Date.now()) / 60000) : 0
    });
  });

  app.get("/api/cache-status", async (req, res) => {
    res.json({
      ...getCacheStats(),
      rateLimitRemaining,
      rateLimitResetIn: rateLimitReset > Date.now() ? Math.ceil((rateLimitReset - Date.now()) / 60000) : 0
    });
  });

  app.post("/api/clear-cache", async (req, res) => {
    const { username } = req.body;
    if (username) {
      const key = username.toLowerCase();
      githubCache.delete(key);
      profileCache.delete(key);
      res.json({ message: `Cache cleared for ${username}` });
    } else {
      githubCache.clear();
      profileCache.clear();
      res.json({ message: "All caches cleared" });
    }
  });

  app.post("/api/batch-compare", async (req, res) => {
    try {
      const { usernames, jobDescription } = req.body;
      
      if (!usernames || !Array.isArray(usernames) || usernames.length === 0) {
        return res.status(400).json({ error: "At least one username is required" });
      }
      if (usernames.length > 20) {
        return res.status(400).json({ error: "Maximum 20 candidates allowed" });
      }
      if (!jobDescription) {
        return res.status(400).json({ error: "Job description is required" });
      }

      const requiredCalls = usernames.length * 2;
      if (rateLimitRemaining < requiredCalls && Date.now() < rateLimitReset) {
        const resetMinutes = Math.ceil((rateLimitReset - Date.now()) / 60000);
        return res.status(429).json({ 
          error: `GitHub rate limit too low (${rateLimitRemaining} remaining). Need ~${requiredCalls} calls. Resets in ${resetMinutes} minutes. Try fewer candidates or wait.`,
          rateLimitRemaining,
          resetIn: resetMinutes
        });
      }

      const results: CandidateRanking[] = [];
      const errors: { username: string; error: string }[] = [];
      let rateLimitHit = false;

      for (let i = 0; i < usernames.length; i++) {
        const username = usernames[i];
        
        if (rateLimitHit) {
          errors.push({ username, error: "Skipped due to rate limit" });
          continue;
        }
        
        try {
          if (i > 0) {
            await delay(1000);
          }
          
          const profile = await analyzeGitHubProfile(username.trim());
          const matchData = await matchProfileToJob(profile, jobDescription);
          results.push({ ...profile, matchData, rank: 0 });
        } catch (error: any) {
          const isRateLimit = error.response?.status === 403 || error.message?.includes('Rate limit');
          
          if (isRateLimit) {
            rateLimitHit = true;
            errors.push({ username, error: "Rate limit exceeded" });
          } else {
            errors.push({ 
              username, 
              error: error.response?.status === 404 
                ? "User not found" 
                : error.message || "Analysis failed"
            });
          }
        }
      }

      results.sort((a, b) => b.matchData.matchScore - a.matchData.matchScore);
      results.forEach((result, index) => {
        result.rank = index + 1;
      });

      res.json({ 
        candidates: results, 
        errors,
        totalAnalyzed: results.length,
        totalFailed: errors.length,
        rateLimitRemaining,
        rateLimitHit
      });
    } catch (error: any) {
      console.error("Batch comparison error:", error);
      res.status(500).json({ error: error.message || "Failed to compare candidates" });
    }
  });

  app.post("/api/search-developers", async (req, res) => {
    try {
      const { skills, location, minRepos, minFollowers } = req.body;
      
      if (!skills || skills.length === 0) {
        return res.status(400).json({ error: "At least one skill is required" });
      }

      let query = skills.join(" ");
      if (location) {
        query += ` location:${location}`;
      }
      if (minRepos) {
        query += ` repos:>=${minRepos}`;
      }
      if (minFollowers) {
        query += ` followers:>=${minFollowers}`;
      }

      const response = await axios.get(
        `https://api.github.com/search/users?q=${encodeURIComponent(query)}&per_page=15`,
        { headers: getGitHubHeaders() }
      );

      const usernames = response.data.items.slice(0, 10).map((u: any) => u.login);
      
      const userDetails = await Promise.all(
        usernames.map(async (username: string) => {
          try {
            const { user } = await fetchGitHubData(username);
            return user;
          } catch {
            return null;
          }
        })
      );

      const users = response.data.items.slice(0, 10).map((user: any, index: number) => {
        const details = userDetails[index];
        return {
          username: user.login,
          name: details?.name || user.login,
          avatar: user.avatar_url,
          bio: details?.bio || "",
          score: user.score,
          profileUrl: user.html_url,
          repos: details?.public_repos,
          followers: details?.followers,
          location: details?.location,
        };
      });

      res.json({
        developers: users,
        totalCount: response.data.total_count,
        query: query,
      });
    } catch (error: any) {
      console.error("Developer search error:", error);
      
      if (error.response?.status === 403) {
        return res.status(429).json({ error: "GitHub API rate limit exceeded. Please try again later." });
      }
      
      res.status(500).json({ error: error.message || "Failed to search developers" });
    }
  });

  app.post("/api/analyses", async (req, res) => {
    try {
      const validatedData = insertSavedAnalysisSchema.parse(req.body);
      const saved = await storage.saveAnalysis(validatedData);
      res.status(201).json(saved);
    } catch (error: any) {
      console.error("Save analysis error:", error);
      res.status(400).json({ error: error.message || "Failed to save analysis" });
    }
  });

  app.get("/api/analyses", async (req, res) => {
    try {
      const analyses = await storage.getAnalyses();
      res.json(analyses);
    } catch (error: any) {
      console.error("Get analyses error:", error);
      res.status(500).json({ error: error.message || "Failed to get analyses" });
    }
  });

  app.get("/api/analyses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid analysis ID" });
      }
      const analysis = await storage.getAnalysisById(id);
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }
      res.json(analysis);
    } catch (error: any) {
      console.error("Get analysis error:", error);
      res.status(500).json({ error: error.message || "Failed to get analysis" });
    }
  });

  app.delete("/api/analyses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid analysis ID" });
      }
      const deleted = await storage.deleteAnalysis(id);
      if (!deleted) {
        return res.status(404).json({ error: "Analysis not found" });
      }
      res.json({ message: "Analysis deleted successfully" });
    } catch (error: any) {
      console.error("Delete analysis error:", error);
      res.status(500).json({ error: error.message || "Failed to delete analysis" });
    }
  });

  app.post("/api/code-dna", async (req, res) => {
    try {
      const { username } = req.body;
      
      if (!username) {
        return res.status(400).json({ error: "Username is required" });
      }

      const codeDna = await analyzeCodeDNA(username);
      res.json(codeDna);
    } catch (error: any) {
      console.error("Code DNA analysis error:", error);
      
      if (error.response?.status === 404) {
        return res.status(404).json({ error: `GitHub user '${req.body.username}' not found` });
      }
      if (error.response?.status === 403) {
        return res.status(429).json({ error: "GitHub API rate limit exceeded. Please try again later." });
      }
      
      res.status(500).json({ error: error.message || "Failed to analyze Code DNA" });
    }
  });

  app.post("/api/export-pdf", async (req, res) => {
    try {
      const { profile, matchData, jobDescription } = req.body;
      
      if (!profile) {
        return res.status(400).json({ error: "Profile data is required" });
      }

      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${profile.username}-skillproof-report.pdf"`);
        res.send(pdfBuffer);
      });

      doc.fontSize(24).fillColor('#0a0a0f').text('SkillProof Report', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#666').text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown(1.5);

      doc.fontSize(18).fillColor('#0a0a0f').text('Candidate Profile');
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#333')
        .text(`Name: ${profile.name || profile.username}`)
        .text(`GitHub: @${profile.username}`)
        .text(`Repositories: ${profile.repos}`)
        .text(`Followers: ${profile.followers}`);
      if (profile.location) doc.text(`Location: ${profile.location}`);
      if (profile.bio) {
        doc.moveDown(0.3);
        doc.text(`Bio: ${profile.bio}`);
      }
      doc.moveDown(1);

      doc.fontSize(18).fillColor('#0a0a0f').text('Technical Skills');
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#333').text(profile.skills.join(', '));
      doc.moveDown(1);

      if (profile.languages && profile.languages.length > 0) {
        doc.fontSize(18).fillColor('#0a0a0f').text('Programming Languages');
        doc.moveDown(0.5);
        profile.languages.forEach((lang: { name: string; percentage: number }) => {
          doc.fontSize(12).fillColor('#333').text(`${lang.name}: ${lang.percentage.toFixed(1)}%`);
        });
        doc.moveDown(1);
      }

      if (profile.experienceSummary) {
        doc.fontSize(18).fillColor('#0a0a0f').text('Experience Summary');
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#333').text(profile.experienceSummary);
        doc.moveDown(1);
      }

      if (profile.strengths && profile.strengths.length > 0) {
        doc.fontSize(18).fillColor('#0a0a0f').text('Key Strengths');
        doc.moveDown(0.5);
        profile.strengths.forEach((strength: string) => {
          doc.fontSize(12).fillColor('#333').text(`• ${strength}`);
        });
        doc.moveDown(1);
      }

      if (matchData) {
        doc.addPage();
        doc.fontSize(18).fillColor('#0a0a0f').text('Job Match Analysis');
        doc.moveDown(0.5);
        
        const scoreColor = matchData.matchScore >= 80 ? '#22c55e' : matchData.matchScore >= 60 ? '#f59e0b' : '#ef4444';
        doc.fontSize(32).fillColor(scoreColor).text(`${matchData.matchScore}%`, { align: 'center' });
        doc.fontSize(12).fillColor('#666').text('Match Score', { align: 'center' });
        doc.moveDown(1);

        const recColor = matchData.recommendation === 'hire' ? '#22c55e' : matchData.recommendation === 'interview' ? '#f59e0b' : '#ef4444';
        doc.fontSize(16).fillColor(recColor).text(`Recommendation: ${matchData.recommendation.toUpperCase()}`, { align: 'center' });
        doc.moveDown(1);

        if (matchData.reasoning) {
          doc.fontSize(14).fillColor('#0a0a0f').text('Analysis');
          doc.moveDown(0.3);
          doc.fontSize(12).fillColor('#333').text(matchData.reasoning);
          doc.moveDown(1);
        }

        if (matchData.matchingSkills && matchData.matchingSkills.length > 0) {
          doc.fontSize(14).fillColor('#22c55e').text('Matching Skills');
          doc.moveDown(0.3);
          doc.fontSize(12).fillColor('#333').text(matchData.matchingSkills.join(', '));
          doc.moveDown(0.8);
        }

        if (matchData.missingSkills && matchData.missingSkills.length > 0) {
          doc.fontSize(14).fillColor('#ef4444').text('Missing Skills');
          doc.moveDown(0.3);
          doc.fontSize(12).fillColor('#333').text(matchData.missingSkills.join(', '));
          doc.moveDown(0.8);
        }

        if (jobDescription) {
          doc.moveDown(0.5);
          doc.fontSize(14).fillColor('#0a0a0f').text('Job Description');
          doc.moveDown(0.3);
          doc.fontSize(10).fillColor('#666').text(jobDescription.substring(0, 1000));
        }
      }

      doc.end();
    } catch (error: any) {
      console.error("PDF export error:", error);
      res.status(500).json({ error: error.message || "Failed to generate PDF" });
    }
  });

  return httpServer;
}
