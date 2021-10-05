const { execSync: exec } = require('child_process');
const COMMIT_SEPARATOR = '-END-';

module.exports = {
  /**
   * @returns {string[]}
   */
  getCommitMessages: () => {
    try {
      const defaultBranchName = String(exec('git remote show origin | grep "HEAD branch" | cut -d" " -f5')).trim();
      return String(exec(`git rev-list --no-merges --format=%B${COMMIT_SEPARATOR} HEAD ^origin/${defaultBranchName}`))
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