import { debug, getInput, setFailed, setOutput } from '@actions/core';
import {
  getPullRequestNumber,
  isMainBranch,
  getMainDiffBase,
  getMainDiffTarget,
  getPullRequestDiffBase as getPullRequestDiffBase,
  getTagForMainDeployment,
  getTagForPullRequestDeployment,
  getPullRequestDiffTarget,
} from '@src/util/github-context';
import { findChangedProjects } from '@src/lib/find-changed-projects';

export const run = (): void => {
  try {
    const pullRequestNumber = getPullRequestNumber();
    const isMain = isMainBranch();
    if (!pullRequestNumber && !isMain) {
      throw new Error('This action only supports push event on main branch or pull request events');
    }

    const rushProjectsInput = getInput('rushProjects');
    const inputs = {
      pullRequestNumber,
      environment: getInput('environment'),
      rushProjects: JSON.parse(rushProjectsInput),
    };

    const outputs = pullRequestNumber ? runForPullRequest(inputs) : runForMain(inputs);
    debug(`Changed projects:\n${JSON.stringify(outputs.changedProjects, null, 2)}`);

    setOutput('changedProjects', outputs.changedProjects);
    setOutput('tag', outputs.tag);
  } catch (error: any) {
    setFailed(error.message);
  }
};

interface MainInputs {
  environment: string;
  rushProjects: RushProject[];
}
interface PullRequestInputs {
  pullRequestNumber: number;
  environment: string;
  rushProjects: RushProject[];
}
interface Output {
  changedProjects: RushProject[];
  tag: string;
}

function runForMain(input: MainInputs): Output {
  const tag = getTagForMainDeployment(input.environment);
  const diffBase = getMainDiffBase(tag);
  const diffTarget = getMainDiffTarget();
  debug(
    `Diffing files for ${input.environment}\nDiff base: ${diffBase}\nDiff target: ${diffTarget}`
  );
  if (diffBase === null) {
    return {
      changedProjects: input.rushProjects,
      tag,
    };
  }
  const changedProjects = findChangedProjects(diffBase, diffTarget, input.rushProjects);
  return {
    changedProjects,
    tag,
  };
}

function runForPullRequest(input: PullRequestInputs): Output {
  const tag = getTagForPullRequestDeployment(input.pullRequestNumber);
  const diffBase = getPullRequestDiffBase(tag);
  const diffTarget = getPullRequestDiffTarget();
  debug(`Diffing files for PR\nDiff base: ${diffBase}\nDiff target: ${diffTarget}`);
  const changedProjects = findChangedProjects(diffBase, diffTarget, input.rushProjects);

  return {
    changedProjects,
    tag,
  };
}
