const github = require('@actions/github');

module.exports = {
  /**
   * @returns {string}
   */
  getPullRequestTitle: () => {
    if (github.context.eventName !== 'pull_request') {
      throw Error(`Checking pull request title won't work on ${github.context.eventName} event type.`);
    }
    return github.context.payload.pull_request.title;
  }
};