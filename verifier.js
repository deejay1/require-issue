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
      if (entry[1] === null) result.invalid.push(entry[0]);
      else if (await checkExistence(entry[1], this.type, this.host, this.token)) result.valid.push(entry[0]);
      else result.notExisting.push(entry[0]);
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
  return message.match(/[A-Z]+-\d+/gm);
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