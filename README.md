# Todoist Gist Updater

This project automatically updates a GitHub Gist with your Todoist productivity stats using GitHub Actions.

## 📊 Gist Preview
```
🌟  250 Karma Points
🌙  1 tasks completed tonight
❄️  7 tasks completed this week
✅  7 tasks completed so far
🔥  1-night streak
```
See it live: [Your Gist](https://gist.github.com/EchoSingh/a69a6866ee53ca5367154074b5cc328b)

## ✨ Features
- Fetches your Todoist completed stats (karma, today, week, total, streak)
- Updates a Gist with beautiful, vibrant, and relevant emoji stats
- Runs automatically every hour, on push, or manually
- No secrets or tokens are stored in code
- Works with plain text or Markdown Gists

## 🚀 Setup Instructions

### 1. Fork or Clone This Repo
```bash
git clone https://github.com/EchoSingh/todoist-gist-updater.git
cd todoist-gist-updater
```

### 2. Create a GitHub Gist
- Go to [gist.github.com](https://gist.github.com/)
- Create a new public Gist (plain text or Markdown)
- Copy the Gist ID from the URL (e.g. `a69a6866ee53ca5367154074b5cc328b`)

### 3. Get Your Todoist API Token
- Go to [Todoist Settings > Integrations](https://todoist.com/prefs/integrations)
- Copy your **API token**

### 4. Create a GitHub Token
- Go to [GitHub Tokens](https://github.com/settings/tokens/new)
- Create a token with the `gist` scope
- Copy the token (you'll use it as `GH_TOKEN`)

### 5. Add GitHub Secrets
In your repo, go to **Settings > Secrets and variables > Actions** and add:
- `TODOIST_API_KEY` — your Todoist API token
- `GIST_ID` — your Gist ID (from step 2)
- `GH_TOKEN` — your GitHub token (from step 4)

### 6. Push to GitHub
```bash
git add .
git commit -m "Initial setup"
git push origin main
```

## 🛠️ How It Works
- The workflow in `.github/workflows/todoist-gist.yml` runs every hour, on push, or manually
- It fetches your Todoist stats and updates your Gist with vibrant, readable stats
- Example Gist: [Your Gist Link](https://gist.github.com/EchoSingh/a69a6866ee53ca5367154074b5cc328b)

## 📝 Customization
- Edit `update-gist.js` to change the emoji, formatting, or add more stats
- You can use Markdown or plain text in your Gist

## 📦 Local Development
```bash
npm install
npm start
```
Set your environment variables in your shell before running locally:
```bash
export TODOIST_API_KEY=your_todoist_token
export GIST_ID=your_gist_id
export GH_TOKEN=your_github_token
npm start
```

## 🤝 Contributing
Pull requests and suggestions are welcome! Open an issue or PR to get started.

## 📄 License
MIT License
