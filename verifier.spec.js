const Verifier = require('./verifier');

const existingIssues = {
  'OPBOX-1': true,
  'MBOX-1234': true,
  'L4-1309': true
};

describe('verifier', () => {

  test('returns all commits having issue string that exists in tracker as valid', async () => {
    //given
    const verifier = new Verifier();
    const commitMessages = [
      'OPBOX-1 | testing', 'OPBOX-1 | done',
      'L4-1309 | testing', 'L4-1309 | done'
    ];

    //when
    const results = await verifier.verifyCommitMessages(commitMessages, async (issue) => existingIssues[issue]);

    // expect
    expect(results).toEqual({ invalid: [], valid: commitMessages, notExisting: [] });
  });

  test('returns all commits having issue string that exists in tracker as valid - multiple issues in one commit', async () => {
    //given
    const verifier = new Verifier();

    //when
    const results = await verifier.verifyCommitMessages(['OPBOX-1 | testing OPBOX-2 task', 'OPBOX-1 | done'], async (issue) => existingIssues[issue]);

    // expect
    expect(results).toEqual({
      invalid: [],
      valid: ['OPBOX-1 | testing OPBOX-2 task', 'OPBOX-1 | done'],
      notExisting: ['OPBOX-1 | testing OPBOX-2 task']
    });
  });

  test('returns all commits having issue string as valid and ones that does not exist in tracker as invalid', async () => {
    //given
    const verifier = new Verifier();

    //when
    const results = await verifier.verifyCommitMessages(['OPBOX-1 | testing', 'OPBOX-2 | more'], async (issue) => existingIssues[issue]);

    // expect
    expect(results).toEqual({ invalid: [], valid: ['OPBOX-1 | testing'], notExisting: ['OPBOX-2 | more'] });
  });

  test('returns all commits that have issue string as valid and ones that does not have it as invalid', async () => {
    //given
    const verifier = new Verifier();

    //when
    const results = await verifier.verifyCommitMessages(['this is not valid', 'OPBOX-1 | this is a valid message'], async (issue) => existingIssues[issue]);

    // expect
    expect(results).toEqual({
      invalid: ['this is not valid'],
      valid: ['OPBOX-1 | this is a valid message'],
      notExisting: []
    });
  });

  test('returns true if pull request title includes issue string and it exists in tracker', async () => {
    //given
    const verifier = new Verifier();
    const prTitles = [
      'OPBOX-1 | testing',
      'L4-1309 | testing'
    ];

    //when
    var results = await Promise.all(prTitles.map((title) => {
      return verifier.verifyTitle(title, async (issue) => existingIssues[issue]);
    }));

    // expect
    results.forEach((result) => {
      expect(result).toEqual(true);
    });
  });

  test('returns false if pull request title includes issue string but it does not exists in tracker', async () => {
    //given
    const verifier = new Verifier();

    //when
    const results = await verifier.verifyTitle('OPBOX-2 | testing', async (issue) => existingIssues[issue]);

    // expect
    expect(results).toEqual(false);
  });

  test('returns false if pull request title does not include issue string', async () => {
    //given
    const verifier = new Verifier();

    //when
    const results = await verifier.verifyTitle('testing');

    // expect
    expect(results).toEqual(false);
  });

  test('returns empty result if commit messages list is empty', async () => {
    //given
    const verifier = new Verifier();

    //when
    const results = await verifier.verifyCommitMessages([]);

    // expect
    expect(results).toEqual({ invalid: [], valid: [], notExisting: [] });
  });
});
