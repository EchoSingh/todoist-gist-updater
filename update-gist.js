const axios = require('axios');
const { Octokit } = require('@octokit/rest');

const todoistToken = process.env.TODOIST_API_KEY;
const gistId = process.env.GIST_ID;
const githubToken = process.env.GH_TOKEN;

if (!todoistToken || !gistId || !githubToken) {
  console.error('Missing required environment variables. Please set TODOIST_API_KEY, GIST_ID, and GH_TOKEN.');
  process.exit(1);
}

const octokit = new Octokit({ auth: githubToken });

async function fetchStats() {
  try {
    const res = await axios.get('https://api.todoist.com/rest/v2/tasks', {
      headers: {
        Authorization: `Bearer ${todoistToken}`
      }
    });
    const tasks = res.data;
    const today = tasks.filter(task => {
      return task.due && task.due.date === new Date().toISOString().split('T')[0];
    });
    return {
      total: tasks.length,
      today: today.length
    };
  } catch (error) {
    console.error('Error fetching Todoist tasks:', error.response ? error.response.data : error.message);
    throw error;
  }
}

async function updateGist(stats) {
  try {
    const gist = await octokit.gists.get({ gist_id: gistId });
    const filename = Object.keys(gist.data.files)[0];
    const content = `#  Todoist Stats\n\n- Total Tasks: ${stats.total}\n- Today's Tasks: ${stats.today}\n\n_Updated at ${new Date().toLocaleString()}_`;
    await octokit.gists.update({
      gist_id: gistId,
      files: {
        [filename]: {
          content
        }
      }
    });
    console.log('Gist updated successfully.');
  } catch (error) {
    console.error('Error updating Gist:', error.response ? error.response.data : error.message);
    throw error;
  }
}

(async () => {
  try {
    const stats = await fetchStats();
    await updateGist(stats);
  } catch (error) {
    console.error('Failed to update gist:', error);
    process.exit(1);
  }
})();
