const axios = require('axios');
const { getOctokit } = require("@actions/github");
const fetch = require("node-fetch");

const todoistToken = process.env.TODOIST_API_KEY;
const gistId = process.env.GIST_ID;
const githubToken = process.env.GH_TOKEN;

const octokit = getOctokit(githubToken);

const formatNumber = (n) => (typeof n === 'number' ? n.toLocaleString() : n);

async function fetchKarma() {
  try {
    const response = await fetch(
      `https://api.todoist.com/sync/v9/completed/get_stats`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${todoistToken}`,
        },
      }
    );
    return await response.json();
  } catch (error) {
    console.error('Error fetching Todoist karma:', error);
    throw error;
  }
}

async function updateGist(data) {
  let gist;
  try {
    gist = await octokit.rest.gists.get({ gist_id: gistId });
  } catch (error) {
    console.error(`Unable to get gist\n${error}`);
    return;
  }

  const lines = [];
  const { karma, completed_count, days_items, week_items, goals } = data;

  if (karma !== undefined) lines.push(`🏆 ${formatNumber(karma)} Karma Points`);
  if (days_items && days_items[0]) lines.push(`🌞 Completed ${formatNumber(days_items[0].total_completed)} tasks today`);
  if (week_items && week_items[0]) lines.push(`📅 Completed ${formatNumber(week_items[0].total_completed)} tasks this week`);
  if (completed_count !== undefined) lines.push(`✅ Completed ${formatNumber(completed_count)} tasks so far`);
  if (goals && goals.last_daily_streak) lines.push(`⌛ Current streak is ${formatNumber(goals.last_daily_streak.count)} days`);

  if (lines.length === 0) return;

  try {
    const filename = Object.keys(gist.data.files)[0];
    await octokit.rest.gists.update({
      gist_id: gistId,
      files: {
        [filename]: {
          filename: `✅ Todoist Stats`,
          content: lines.join("\n"),
        },
      },
    });
    console.log('Gist updated successfully.');
  } catch (error) {
    console.error(`Unable to update gist\n${error}`);
  }
}

(async () => {
  try {
    const karmaData = await fetchKarma();
    await updateGist(karmaData);
  } catch (error) {
    console.error('Failed to update gist:', error);
    process.exit(1);
  }
})();
