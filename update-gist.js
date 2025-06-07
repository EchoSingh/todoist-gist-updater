const axios = require('axios');
const { Octokit } = require("@octokit/rest");

const todoistToken = process.env.TODOIST_API_KEY;
const gistId = process.env.GIST_ID;
const githubToken = process.env.GH_TOKEN;

const octokit = new Octokit({ auth: githubToken });

const formatNumber = (n) => (typeof n === 'number' ? n.toLocaleString() : n);

async function fetchKarma() {
  try {
    const response = await axios.get(
      `https://api.todoist.com/sync/v9/completed/get_stats`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${todoistToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching Todoist karma:', error);
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
  lines.push('𓆩𓆪 "It\'s not who I am underneath, but what I do that defines me." 𓆩𓆪');
  lines.push('');
  const { karma, completed_count, days_items, week_items, goals } = data;
  if (karma !== undefined) lines.push(`⚛  ${formatNumber(karma)} Karma Points`);
  if (days_items && days_items[0]) lines.push(`࣪ ִֶָ☾. ${formatNumber(days_items[0].total_completed)} tasks completed tonight`);
  if (week_items && week_items[0]) lines.push(` ❄︎ ${formatNumber(week_items[0].total_completed)} tasks completed this week`);
  if (completed_count !== undefined) lines.push(`✎  ${formatNumber(completed_count)} tasks completed so far`);
  if (goals && goals.last_daily_streak) lines.push(`♕  ${formatNumber(goals.last_daily_streak.count)}-night streak`);
  lines.push('');
 

  if (lines.length === 0) return;

  try {
    const filename = Object.keys(gist.data.files)[0];
    await octokit.gists.update({
      gist_id: gistId,
      files: {
        [filename]: {
          filename: ` Todoist Stats.txt`,
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
