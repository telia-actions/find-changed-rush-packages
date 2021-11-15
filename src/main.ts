import {
  getAllPackages,
  getChangedPackages,
  getDiffTargetMain,
  getDiffTargetPullRequest,
  getTagForDeployment,
  readJson,
} from './utils';
import { debug, getInput, info, setFailed, setOutput } from '@actions/core';
import { getPullRequestNumber, isMainBranch } from './github';

const run = (): void => {
  try {
    const environment = getInput('environment');
    const rushJsonPath = getInput('rushJsonPath');

    const pullRequestNumber = getPullRequestNumber();
    const isMain = isMainBranch();

    if (!pullRequestNumber && !isMain) {
      throw new Error('This action only supports push event on main branch or pull request events');
    }

    const tagForDeployment = getTagForDeployment(pullRequestNumber, environment);
    const diffTarget = isMain
      ? getDiffTargetMain(tagForDeployment)
      : getDiffTargetPullRequest(tagForDeployment);
    const rushPackages: RushPackage[] = readJson(rushJsonPath).projects;

    debug(JSON.stringify(rushPackages, null, 2));

    const changedProjects = diffTarget
      ? getChangedPackages(diffTarget, rushPackages)
      : getAllPackages(rushPackages);

    info(JSON.stringify(changedProjects, null, 2));

    setOutput('changedProjects', changedProjects);
    setOutput('tag', tagForDeployment);
  } catch (e) {
    setFailed(e.message);
  }
};

run();
