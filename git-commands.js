const { execSync: exec } = require('child_process');

module.exports = {
  /**
   * @returns {string[]}
   */
  getCommitMessages: () => {
    try {
      const defaultBranchName = String(exec('git remote show origin | grep "HEAD branch" | cut -d" " -f5')).trim();
      return String(exec(`git rev-list --format=%B HEAD ^origin/${defaultBranchName}`)).trim().split('\n\n').filter(elem => elem !== '');
    } catch (error) {
      throw new Error(`git command error: ${error}`);
    }
  }
};