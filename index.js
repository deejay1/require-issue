const core = require('@actions/core');
const github = require('@actions/github');
const Verifier = require('./verifier');
const { getCommitMessages } = require('./git-commands');
const { getPullRequestTitle } = require('./gh-commands');

const host = core.getInput('host');
const token = core.getInput('token');
const type = core.getInput('type');

const verifier = new Verifier(type, host, token);
const commitMessages = getCommitMessages();

process.on('unhandledRejection', up => {
  core.setFailed(`Action failed ${up}`);
});

(async () => {
  if (github.context.eventName === 'push') {
    const results = await verifier.verifyCommitMessages(commitMessages);
    if (results.invalid.length) {
      results.invalid.forEach(message => core.error(`found commit message without issue: \n${message}`));
      core.setFailed(`found ${results.invalid.length} commits without issue`);
      process.exit(1);
    }
  } else {
    core.info('skipping commit messages validation, this works only on push event');
  }

  if (github.context.eventName === 'pull_request') {
    const pullRequestTitle = getPullRequestTitle();
    const result = await verifier.verifyTitle(pullRequestTitle);
    if (!result) {
      core.setFailed('no issue found in pull request title');
    }
  } else {
    core.info('skipping pull request title validation, this works only on pull_request event');
  }
})();


