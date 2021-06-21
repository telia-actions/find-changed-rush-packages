import fs from 'fs';
import { getPullRequestNumber, getTagSHA, isMainBranch, isChangeInPath } from './github';
import { debug } from '@actions/core';

export const getLastDeployedRef = (environment: string): TagRef => {
  const pullRequestNumber = getPullRequestNumber();
  if (isMainBranch()) {
    return { tag: `refs/tags/${environment}`, sha: getTagSHA(environment) };
  } else if (pullRequestNumber) {
    debug(`Looking for tag with pull request number - "${pullRequestNumber}"`);
    const refInFeatureBranch = getTagSHA(`preview-${pullRequestNumber}`);
    if (refInFeatureBranch) {
      return { tag: `refs/tags/preview-${pullRequestNumber}`, sha: refInFeatureBranch };
    }
    debug(`Tag in branch does not exists, using environment - "${environment}" `);
    return { tag: `refs/tags/${environment}`, sha: getTagSHA(environment) };
  }
  throw new Error('This action only supports push event on main branch or pull request events');
};

export const getChangedPackages = (
  lastDeployedRef: string,
  rushPackages: RushPackage[]
): PackageCategories => {
  return rushPackages.reduce<PackageCategories>((categories, _package) => {
    if (isChangeInPath(lastDeployedRef, _package.projectFolder)) {
      updatePackageCategories(_package.projectFolder, categories);
    }
    return categories;
  }, getInitialPackageCategories());
};

export const getAllPackages = (rushPackages: RushPackage[]): PackageCategories => {
  return rushPackages.reduce<PackageCategories>((categories, _package) => {
    updatePackageCategories(_package.projectFolder, categories);
    return categories;
  }, getInitialPackageCategories());
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

const getInitialPackageCategories = (): PackageCategories => {
  return {
    aws: [],
    k8s: [],
  };
};

const updatePackageCategories = (projectFolder: string, output: PackageCategories): void => {
  const deployCategory = readJson(`${projectFolder}/package.json`).deployCategory as DeployCategory;
  if (deployCategory && (deployCategory === 'aws' || deployCategory === 'k8s')) {
    output[deployCategory].push(projectFolder);
  }
};
