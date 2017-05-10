const path = require('path');
const git = require('nodegit');

const buildScriptsDir = __dirname;
const repoDir = path.join(buildScriptsDir, '.');

// TODO: DON'T COMMIT THIS TOKEN
const ghToken = '9fc5c1f175c4bedc1f4d29a88cd9e1c3094914d6';

const testBranch = 'qa';

function checkoutUAT(repository) {
  console.log('Checking out uat branch...');
  return repository.checkoutBranch(testBranch);
}

function getMasterHead(repository) {
  console.log('Getting master...');
  return repository.getBranchCommit('master'); // TODO: origin/master
}

// Resetting to master is a 2-step process; Fetch a commit references to
// master's HEAD, and then reset the current state to that point. Both of
// those are async operations in nodegit, so wrap it in a new promise so it
// appears like a single operation.
function hardResetToMaster(repository) {
  console.log('Resetting uat to master...');
  return new Promise((resolve, reject) => {
    getMasterHead(repository)
      .then(masterRef => {
        git.Reset.reset(repository, masterRef, git.Reset.TYPE.HARD)
          .then(resolve)
          .catch(reject);
      })
      .catch(reject);
  });
}

const mergeBranches = branches =>
  repository => {
    console.log(`Merging ${branches.length} branches...`);
    const MergeSignature = git.Signature.default(repository);
    branches.reduce((p, branch) => {
      console.info(`Merging ${branch}`);
      return p.then(() =>
        repository.mergeBranches('uat', branch)
          .catch(() => console.error(`Failed to merge '${branch}', skipping`))
      )
    }, Promise.resolve())
      .then(() => console.log('Done merging.'));

    return Promise.resolve();
  }

// commit-ish http://stackoverflow.com/questions/23303549/what-are-commit-ish-and-tree-ish-in-git
// TODO: fetch PR branch list from GitHub
// Maybe fetch only PRs with no build, build success?
// Maybe comment on PR being built when another PR can't be merged due to conflicts?
const branches = [
  'feature1',
  'feature2',
  'conflict1'
];

const toMerge = mergeBranches(branches);

git.Repository.open(repoDir)
  .then((repo) => {
    Promise.resolve() // TODO: fetch origin to make sure origin/master is up to date
      .then(() => checkoutUAT(repo))
      .then(() => hardResetToMaster(repo))
      .then(() => mergeBranches(toMerge(repo)))
  })
  .catch((err) => console.error('failed to open repo:', err))

// .then(getMostRecentCommit).then(getCommitMessage).then(function(message) {console.log(message);});
