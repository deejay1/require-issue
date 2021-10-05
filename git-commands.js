const { execSync: exec } = require('child_process');
const COMMIT_SEPARATOR = '-END-';

module.exports = {
  /**
   * @returns {string[]}
   */
  getCommitMessages: (includeMergeCommits = true) => {

    try {
      const defaultBranchName = String(exec('git remote show origin | grep "HEAD branch" | cut -d" " -f5')).trim();
      let gitListCommand;
      if (includeMergeCommits) {
        gitListCommand = `git rev-list --format=%B${COMMIT_SEPARATOR} HEAD ^origin/${defaultBranchName}`;
      } else {
        gitListCommand = `git rev-list --no-merges --format=%B${COMMIT_SEPARATOR} HEAD ^origin/${defaultBranchName}`;
      }
      return String(exec(gitListCommand))
        .trim()
        .replace(/\n/g, ' ')
        .split(new RegExp(COMMIT_SEPARATOR))
        .map(it => it.trim())
        .filter(it => it !== '');
    } catch (error) {
      throw new Error(`git command error: ${error}`);
    }
  }
};