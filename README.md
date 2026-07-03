# AI Lab Interview Prep — Anthropic & OpenAI (2026)

A single-page, build-first prep dashboard for clearing the technical loops at the top AI labs.

**What's inside**
- The 2026 **AI-off vs AI-on** interview divide (why the labs still make you hand-code live)
- **How AI labs test vs FAANG LeetCode** — side-by-side comparison + an interview-funnel diagram
- **Two company lists**: who makes you code by hand vs. who allows/encourages AI in interviews
- An interactive **8-week, build-first plan** (progress saves in your browser via `localStorage`)
- A **problem bank** of the recurring lab-style builds and a curated **resource list**

Everything is static (HTML/CSS/JS + Mermaid via CDN) — no build step, ideal for GitHub Pages.

## Preview locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Publish to GitHub Pages (github.com)

This must go on your **personal github.com** account — not a corporate GitHub Enterprise host.
One-time auth, then a single script:

```bash
# 1) one-time browser auth to github.com
gh auth login --hostname github.com --web

# 2) create the repo, push, and enable Pages
./deploy.sh                 # or: ./deploy.sh my-custom-repo-name
```

The script prints your live URL: `https://<your-username>.github.io/ai-interview-prep/`.
(GitHub Pages typically goes live within a minute.)

### Manual alternative

```bash
GH_HOST=github.com gh repo create ai-interview-prep --public --source=. --remote=origin --push
GH_HOST=github.com gh api -X POST repos/<you>/ai-interview-prep/pages \
  -f 'source[branch]=main' -f 'source[path]=/'
```

## Structure

```
index.html        # all content + sections
assets/styles.css # dark, responsive theme
assets/app.js     # plan data, progress tracking, Mermaid init
deploy.sh         # create repo + enable Pages
```

> Interview policies change fast and vary by team/level/round. Every company entry is
> "confirm with your recruiter." Last reviewed: July 2026.
