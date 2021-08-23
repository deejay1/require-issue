const core = require('@actions/core');
const fetch = require('node-fetch');
const existingIssues = [];

module.exports = class Verifier {

  constructor(type, host, token) {
    this.type = type;
    this.host = host;
    this.token = token;
  }

  async verifyCommitMessages(commitMessages = [], checkExistence = exists) {
    if (!commitMessages.length) {
      core.info('no commits found to verify');
      return { valid: [], invalid: [], notExisting: [] };
    }
    core.info(`found ${commitMessages.length} commits`);
    commitMessages.forEach((msg) => core.info(msg));
    const issues = new Map(commitMessages.map(value => [value, findIssueKeys(value)]));
    const result = { valid: [], invalid: [], notExisting: [] };
    for (const entry of [...issues.entries()]) {
      const commitMessage = entry[0];
      const foundIssues = entry[1];
      if (foundIssues.size === 0) result.invalid.push(commitMessage);
      for (const issue of foundIssues) {
        const exists = await checkExistence(issue, this.type, this.host, this.token);
        if (exists) {
          result.valid.push(commitMessage);
        } else {
          result.notExisting.push(commitMessage);
        }
      }
    }
    return result;
  }

  async verifyTitle(title, checkExistence = exists) {
    core.info(`found '${title}' pr title`);
    const titleIssues = [...new Set(findIssueKeys(title))].filter(Boolean).flat();
    if (!titleIssues.length) return false;
    return [...await Promise.all(titleIssues.map(async issueKey => await checkExistence(issueKey, this.type, this.host, this.token)))].every(Boolean);
  }
};

function findIssueKeys(message) {
  return new Set(message.match(/[A-Z0-9]+-\d+/gm));
}

function exists(issueKey, type, host, token) {
  switch (type) {
    case 'jira': {
      if (existingIssues.includes(issueKey)) return Promise.resolve(true);
      return fetch(`https://${host}/browse/${issueKey}`, {
        method: 'HEAD',
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(response => {
          if (response.status / 100 !== 2) core.setFailed(`issue ${issueKey} not found`);
          existingIssues.push(issueKey);
          return true;
        })
        .catch((error) => {
          core.error(error);
          return false;
        });
    }
    default: {
      throw new Error(`unknown issue tracker type ${type}`);
    }
  }
}