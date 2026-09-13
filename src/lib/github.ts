import { siteConfig } from "@/../site.config";

const GH = "https://api.github.com";

export type GitHubRepo = {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  updated_at: string;
};

export type GitHubEvent = {
  id: string;
  type: string;
  repo: { name: string; url: string };
  created_at: string;
  payload: {
    commits?: { message: string; sha: string }[];
  };
};

const headers: Record<string, string> = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};
if (process.env.GITHUB_TOKEN)
  headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

export async function fetchRepos(limit = 6): Promise<GitHubRepo[]> {
  try {
    // Always pull a wider window from GitHub, then slice locally. Avoids
    // missing recent activity when the caller asks for a small N.
    const res = await fetch(
      `${GH}/users/${siteConfig.github.username}/repos?sort=updated&per_page=30`,
      {
        headers,
        next: { revalidate: 60 * 30 },
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as GitHubRepo[];
    return data
      .filter((r) => !r.full_name.endsWith(".github.io"))
      .slice(0, limit);
  } catch {
    return [];
  }
}

export async function fetchEvents(limit = 10): Promise<GitHubEvent[]> {
  try {
    // Pull GitHub's max page (100) so we still surface PushEvents when the
    // tail of the feed is dominated by Watch/Star/PR events.
    const res = await fetch(
      `${GH}/users/${siteConfig.github.username}/events/public?per_page=100`,
      { headers, next: { revalidate: 60 * 30 } },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as GitHubEvent[];
    return data.slice(0, limit);
  } catch {
    return [];
  }
}

export type GitHubPullRequest = {
  id: number;
  title: string;
  number: number;
  html_url: string;
  state: "open" | "closed";
  merged: boolean;
  created_at: string;
  updated_at: string;
  repo: string; // owner/name (parsed from repository_url)
  repoUrl: string;
};

/**
 * Latest PRs authored by the user via the search API.
 * Sorted by created_at desc. Works across both public and (the
 * user's own) private repos when the user is authenticated, but in
 * the absence of a token only surfaces those in public repos.
 */
export async function fetchPullRequests(
  limit = 8,
): Promise<GitHubPullRequest[]> {
  try {
    const q = encodeURIComponent(`author:${siteConfig.github.username} is:pr`);
    const res = await fetch(
      `${GH}/search/issues?q=${q}&sort=created&order=desc&per_page=${Math.min(limit * 2, 50)}`,
      { headers, next: { revalidate: 60 * 30 } },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as {
      items: Array<{
        id: number;
        number: number;
        title: string;
        html_url: string;
        state: "open" | "closed";
        created_at: string;
        updated_at: string;
        pull_request?: { merged_at: string | null };
        repository_url: string;
      }>;
    };
    return data.items.slice(0, limit).map((p) => {
      // repository_url is "https://api.github.com/repos/owner/name"
      const repo = p.repository_url.replace(`${GH}/repos/`, "");
      return {
        id: p.id,
        number: p.number,
        title: p.title,
        html_url: p.html_url,
        state: p.state,
        merged: Boolean(p.pull_request?.merged_at),
        created_at: p.created_at,
        updated_at: p.updated_at,
        repo,
        repoUrl: `https://github.com/${repo}`,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Aggregate counts derived from the public events feed. Not a perfect
 * mirror of the GitHub profile contribution chart (which uses private
 * data too), but gives a useful snapshot for the live-feed banner.
 */
export type GitHubCounts = {
  pushes: number;
  commits: number;
  prs: number;
  reposTouched: number;
  windowDays: number;
};

export async function fetchActivityCounts(): Promise<GitHubCounts> {
  try {
    const evs = await fetchEvents(100);
    let pushes = 0;
    let commits = 0;
    let prs = 0;
    const repos = new Set<string>();
    let oldest = Date.now();
    for (const e of evs) {
      const ts = +new Date(e.created_at);
      if (ts < oldest) oldest = ts;
      repos.add(e.repo.name);
      if (e.type === "PushEvent") {
        pushes += 1;
        commits += e.payload?.commits?.length ?? 0;
      } else if (e.type === "PullRequestEvent") {
        prs += 1;
      }
    }
    const days = Math.max(1, Math.round((Date.now() - oldest) / 86400000));
    return {
      pushes,
      commits,
      prs,
      reposTouched: repos.size,
      windowDays: days,
    };
  } catch {
    return { pushes: 0, commits: 0, prs: 0, reposTouched: 0, windowDays: 90 };
  }
}

export type GitHubCommit = {
  sha: string;
  html_url: string;
  message: string;
  date: string; // ISO
  repo: string; // owner/name
  repoUrl: string;
};

/**
 * Fetch latest commits directly from each of the user's top N public repos.
 * Reliable even when the public events feed has no PushEvents (e.g. when
 * recent work has been on private repos or non-default branches that don't
 * surface in /events).
 *
 * 1) Pulls up to `repoCount` recently-updated public repos.
 * 2) For each, fetches the latest `perRepo` commits authored by the user.
 * 3) Merges, sorts by date desc, returns the top `limit`.
 */
export async function fetchLatestCommits(
  limit = 6,
  repoCount = 6,
  perRepo = 3,
): Promise<GitHubCommit[]> {
  try {
    const repos = await fetchRepos(repoCount);
    if (!repos.length) return [];

    const fetches = repos.map(async (r) => {
      try {
        const res = await fetch(
          `${GH}/repos/${r.full_name}/commits?author=${siteConfig.github.username}&per_page=${perRepo}`,
          { headers, next: { revalidate: 60 * 30 } },
        );
        if (!res.ok) return [] as GitHubCommit[];
        const data = (await res.json()) as Array<{
          sha: string;
          html_url: string;
          commit: { message: string; author: { date: string } };
        }>;
        return data.map((c) => ({
          sha: c.sha,
          html_url: c.html_url,
          message: c.commit.message.split("\n")[0],
          date: c.commit.author.date,
          repo: r.full_name,
          repoUrl: r.html_url,
        }));
      } catch {
        return [] as GitHubCommit[];
      }
    });

    const results = await Promise.all(fetches);
    const all = results.flat();
    all.sort((a, b) => +new Date(b.date) - +new Date(a.date));
    return all.slice(0, limit);
  } catch {
    return [];
  }
}
