const vars = require('./serviceVars');
const config = require('./configHandler').getConfig();

module.exports = {
  getLatestCommit: async (service, user) => {
    const serviceConfig = config.services[service];
    return module.exports[service].findLatestCommit(user, serviceConfig.token);
  },
  github: {
    findLatestCommit: async (user, token) => {
      const vars = vars.github;
      let count = 1;
      let loaded = 0;
      let page = 0;
      while (loaded < count) {
        page++;
        const repoRes = await fetch(
          `https://api.github.com/search/repositories?q=user:${user}&sort=updated&per_page=10&page=${page}`, {
            headers: {
              'Accept': 'application/vnd.github.cloak-preview+json',
              'Authorization': `token ${token}`
            }
          }
        );

        const json = await repoRes.json();
        if (!json || json.message) return null;
        count = json.total_count;
        const repoData = json.items;
        if (!repoData) return null;
        loaded += repoData.length;
        if (repoData.length === 0) return null;

        const commit = await module.exports.github.findLatestCommitInRepoList(repoData, user, token);
        if (commit) return commit;
      }
    },
    findLatestCommitInRepoList: async (repoData, user, token) => {
      let candidate;
      for (let repo of repoData) {
        if (candidate && repo.updated_at <= candidate.commit.author.date) {
          // if current repo is older than newest user commit from
          // previous repo then we have found the latest user commit
          return candidate;
        }
        const commitRes = await fetch(
          `https://api.github.com/repos/${repo.full_name}/commits?author=${user}`, {
            headers: {
              'Accept': 'application/json',
              'Authorization': `token ${token}`
            }
          }
        );
        const commitData = await commitRes.json();
        if (!commitData || commitData.message) continue;

        let newestCommit = commitData.find((commit) => commit.author.login === user);
        if (!newestCommit) continue;
        newestCommit.repo = repo.name;
        newestCommit.privateRepo = repo.private;

        if (!candidate || candidate.commit.author.date < newestCommit.commit.author.date) {
          // if current best candidate is older than newest commit from repo
          // then we have a better candidate
          candidate = newestCommit;
        }
        if (commitData[0].sha === newestCommit.sha) {
          // if newest user commit is the latest commit in repo
          // then we have found the latest user commit (due to sorting)
          // OR if this commit isn't the best candidate we can safely assume
          // there's no better candidate than the current one
          return candidate;
        }
      }
      return null;
    }
  }
};