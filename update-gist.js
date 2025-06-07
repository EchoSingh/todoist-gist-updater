require("dotenv").config();
const axios = require('axios');
const humanize = require("humanize-number");

const todoistToken = process.env.TODOIST_API_KEY;
const gistId = process.env.GIST_ID;
const githubToken = process.env.GH_TOKEN;

const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({ auth: githubToken });

async function fetchKarma() {
  try {
    const res = await axios.get('https://api.todoist.com/sync/v9/completed/get_stats', {
      headers: {
        Authorization: `Bearer ${todoistToken}`
      }
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching Todoist karma:', error.response ? error.response.data : error.message);
    throw error;
  }
}

async function updateGist(data) {
  let gist;
  try {
    gist = await octokit.gists.get({ gist_id: gistId });
  } catch (error) {
    console.error(`Unable to get gist\n${error}`);
    return;
  }

  const lines = [];
  const { karma_points, completed_count, days_items, week_items, goals } = data;

  if (karma_points !== undefined) lines.push(`🏆 ${humanize(karma_points)} Karma Points`);
  if (days_items && days_items[0]) lines.push(`🌞 Completed ${days_items[0].total_completed} tasks today`);
  if (week_items && week_items[0]) lines.push(`📅 Completed ${week_items[0].total_completed} tasks this week`);
  if (completed_count !== undefined) lines.push(`✅ Completed ${humanize(completed_count)} tasks so far`);
  if (goals && goals.last_daily_streak) lines.push(`⌛ Current streak is ${humanize(goals.last_daily_streak.count)} days`);

  if (lines.length === 0) return;

  try {
    const filename = Object.keys(gist.data.files)[0];
    await octokit.gists.update({
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
