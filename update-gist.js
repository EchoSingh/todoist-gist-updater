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

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function getWeekStartDate() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}

async function fetchStats() {
  try {
    const res = await axios.get('https://api.todoist.com/rest/v2/tasks', {
      headers: {
        Authorization: `Bearer ${todoistToken}`
      }
    });
    const tasks = res.data;
    const today = tasks.filter(task => {
      return task.due && task.due.date === getTodayDate();
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

async function updateGist(stats, karma) {
  try {
    const gist = await octokit.gists.get({ gist_id: gistId });
    const filename = Object.keys(gist.data.files)[0];
    const content = `
🦇 **BATMAN Todoist Stats** 🦇

🏆 **${karma.karma}** Karma Points
🌞 **${karma.completed_today}** tasks completed today
📅 **${karma.completed_this_week}** tasks completed this week
✅ **${karma.completed_total}** tasks completed so far
⌛ **${karma.current_streak}**-day streak

---

🛠️ **Total Open Tasks:** ${stats.total}
🗓️ **Tasks Due Today:** ${stats.today}

"It's not who I am underneath, but what I do that defines me."

_Updated at ${new Date().toLocaleString()}_
`;
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
    const karmaData = await fetchKarma();
    const todayDate = getTodayDate();
    const weekStart = getWeekStartDate();
    const daysDetails = Array.isArray(karmaData.days_details) ? karmaData.days_details : [];
    const completed_today = daysDetails.find(d => d.date === todayDate)?.completed || 0;
    const completed_this_week = daysDetails.filter(d => d.date >= weekStart).reduce((sum, d) => sum + d.completed, 0);
    const completed_total = karmaData.completed_count || 0;
    const karma = karmaData.karma_points || 0;
    const current_streak = karmaData.current_daily_streak || 0;
    await updateGist(stats, {
      completed_today,
      completed_this_week,
      completed_total,
      karma,
      current_streak
    });
  } catch (error) {
    console.error('Failed to update gist:', error);
    process.exit(1);
  }
})();
