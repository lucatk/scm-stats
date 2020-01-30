const serviceVars = require('./serviceVars');
const config = require('./configHandler').getConfig();
const { getStat, updateStat } = require('./cacheHandler');

module.exports = {
  getLatestCommit: async (user) => {
    const { services } = config;
    if (!services) return null;
    const latestCommits = await Promise.all(
      Object.keys(services)
        .filter((service) => services[service] && services[service].token)
        .map((service) => module.exports.getLatestCommitFromService(service, user))
    );
    return latestCommits.reduce((latest, commit) => {
      if (commit && (!latest || latest.date < commit.date)) {
        return commit;
      }
      return latest;
    }, null);
  },
  getLatestCommitFromService: async (service, user) => {
    const cached = getStat('latestCommit', service);
    if (cached && cached.data && (cached.timestamp + 1200000) > new Date().getTime()) {
      return cached.data;
    }
    const serviceConfig = config.services[service];
    if (!serviceConfig || !serviceConfig.token) {
      return null;
    }

    const candidate = await module.exports[service].findLatestCommit(user, serviceConfig.token);
    console.log(new Date().getTime(), 'received', service);
    if (candidate) {
      await updateStat('latestCommit', service, {
        timestamp: new Date().getTime(),
        data: candidate
      });
    }
    return candidate;
  },
  github: {
    findLatestCommit: async (user, token) => {
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
        if (commit) {
          return {
            date: commit.commit.author.date,
            privateRepo: commit.privateRepo,
            repository: commit.repo,
            message: commit.commit.message,
            url: commit.html_url
          };
        }
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
  },
  gitlab: {
    findLatestCommit: async (user, token) => {
      const eventRes = await fetch(
        `https://gitlab.com/api/v4/users/${user}/events?action=pushed`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const json = await eventRes.json();
      if (!json || json.error || json.length === 0) return null;
      const target = json[0];
      if (!target) return null;
      const pushData = target.push_data;
      if (!pushData) return null;

      const projectId = target.project_id;
      const commitSha = pushData.commit_to;

      const [projectRes, commitRes] = await Promise.all([
        fetch(
          `https://gitlab.com/api/v4/projects/${projectId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        ),
        fetch(
          `https://gitlab.com/api/v4/projects/${projectId}/repository/commits/${commitSha}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )
      ]);
      const projectData = await projectRes.json();
      if (!projectData || projectData.error || projectData.message) return null;
      const commitData = await commitRes.json();
      if (!commitData || commitData.error) return null;

      return {
        date: commitData.committed_date,
        privateRepo: projectData.visibility === 'private',
        repository: projectData.name,
        message: commitData.message,
        url: `${projectData.web_url}/commit/${commitSha}`
      };
    }
  }
};