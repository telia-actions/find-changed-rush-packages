import { debug, getInput, setFailed } from '@actions/core';
import { getPullRequestNumber, isMainBranch } from '@src/util/github-context';

export const run = (): void => {
  try {
    const pullRequestNumber = getPullRequestNumber();
    const isMain = isMainBranch();
    if (!pullRequestNumber && !isMain) {
      throw new Error('This action only supports push event on main branch or pull request events');
    }
    // const environment = getInput('environment');
    const rushProjectsInput = getInput('rushProjects');
    // const tagForDeployment = getTagForDeployment(pullRequestNumber, environment);
    // const diffTarget = isMain
    //   ? getDiffTargetMain(tagForDeployment)
    //   : getDiffTargetPullRequest(tagForDeployment);
    debug(rushProjectsInput);
    // const rushProjects: RushProject[] = JSON.parse(rushProjectsInput);
    // debug(JSON.stringify(rushProjects, null, 2));
    // const changedProjects = diffTarget
    //   ? findChangedProjects(diffTarget, rushProjects)
    //   : rushProjects;
    // debug(JSON.stringify(changedProjects, null, 2));
    // setOutput('changedProjects', changedProjects);
    // setOutput('tag', tagForDeployment);
  } catch (error: any) {
    setFailed(error.message);
  }
};
