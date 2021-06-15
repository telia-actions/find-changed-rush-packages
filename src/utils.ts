import fs from 'fs';
import { getPullRequestNumber, getTagCommitSha, isMainBranch, isChangeInPath } from './github';
import { debug } from '@actions/core';

export const getChangedPackages = (
  lastDeployedRef: string,
  rushProjects: RushProjects[]
): ActionOutputs => {
  return rushProjects.reduce<ActionOutputs>((output, project) => {
    if (isChangeInPath(lastDeployedRef, project.projectFolder)) {
      const deployCategory = getDeployCategory(project.projectFolder);
      if (deployCategory) {
        output[deployCategory].push(project.projectFolder);
      }
    }
    return output;
  }, getInitialOutput());
};

export const getAllPackages = (rushProjects: RushProjects[]): ActionOutputs => {
  return rushProjects.reduce<ActionOutputs>((output, project) => {
    const deployCategory = getDeployCategory(project.projectFolder);
    if (deployCategory) {
      output[deployCategory].push(project.projectFolder);
    }
    return output;
  }, getInitialOutput());
};

export const readJson = (jsonPath: string): any => {
  return JSON.parse(
    fs
      .readFileSync(jsonPath, 'utf-8')
      .replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (jsonKeyOrValue, comment) =>
        comment ? '' : jsonKeyOrValue
      )
  );
};

export const getLastDeployedRef = (environment: string): string => {
  const pullRequestNumber = getPullRequestNumber();
  if (pullRequestNumber) {
    debug(`Looking for tag with PR number - ${pullRequestNumber}`);
    return getCommitShaForFeatureBranch(pullRequestNumber, environment);
  } else if (isMainBranch()) {
    debug(`Push to main branch, looking for tag in main with environment - "${environment}"`);
    return getTagCommitSha(environment);
  }
  throw new Error('This action only supports push event on main branch or pull request events');
};

const getInitialOutput = (): ActionOutputs => {
  return {
    aws: [],
    k8s: [],
  };
};

const getDeployCategory = (projectFolder: string): DeployCategory | undefined => {
  const deployCategory = readJson(`${projectFolder}/package.json`).deployCategory as DeployCategory;
  if (deployCategory && (deployCategory === 'aws' || deployCategory === 'k8s')) {
    return deployCategory;
  }
};

const getCommitShaForFeatureBranch = (pullRequestNumber: number, environment: string): string => {
  const commitShaInFeatureBranch = getTagCommitSha(`preview-${pullRequestNumber}`);
  if (commitShaInFeatureBranch) {
    return commitShaInFeatureBranch;
  }
  debug(
    `Tag in branch does not exist, looking for tag in main with environment - "${environment}"`
  );
  return getTagCommitSha(environment);
};
