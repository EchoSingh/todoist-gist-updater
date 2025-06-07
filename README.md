# Todoist Gist Updater

This project updates a GitHub Gist with your Todoist stats every hour using GitHub Actions.

## Features
- Fetches all your Todoist tasks
- Counts total and today's tasks
- Updates a GitHub Gist with the stats
- Robust error handling

## Setup
1. **Fork or clone this repo.**
2. **Create a Gist** on GitHub to hold your stats.
3. **Add the following secrets** to your GitHub repository:
   - `TODOIST_API_KEY`: Your Todoist API token
   - `GIST_ID`: The ID of your Gist
   - `GH_TOKEN`: A GitHub token with Gist scope
4. **Enable GitHub Actions** in your repo.

## Local Development
```bash
npm install
npm start
```

## Linting
```bash
npm run lint
```

---

MIT License
