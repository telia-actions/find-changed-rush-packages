import fs from 'fs';
import { getPullRequestNumber, getTagSha, isMainBranch, isChangeInPath } from './github';
import { debug } from '@actions/core';

export const getTagForDeployment = (environment: string): string => {
  const pullRequestNumber = getPullRequestNumber();
  if (pullRequestNumber) {
    return `preview-${pullRequestNumber}`;
  }
  if (isMainBranch()) {
    return environment;
  }
  throw new Error('This action only supports push event on main branch or pull request events');
};

export const getLastDeployedRef = (environment: string, tagName: string): string => {
  debug(`Looking for last deployed ref - "${tagName}"`);
  const tagSha = getTagSha(tagName);
  if (tagSha) {
    return tagSha;
  }
  debug(`Tag was not found, deploy based on environment - "${environment}" `);
  return getTagSha(environment);
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
  }, {});
};

export const getAllPackages = (rushPackages: RushPackage[]): PackageCategories => {
  return rushPackages.reduce<PackageCategories>((categories, _package) => {
    updatePackageCategories(_package.projectFolder, categories);
    return categories;
  }, {});
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

const updatePackageCategories = (projectFolder: string, output: PackageCategories): void => {
  const deployCategory = readJson(`${projectFolder}/package.json`).deployCategory as DeployCategory;
  if (deployCategory) {
    if (!output[deployCategory]) {
      output[deployCategory] = [];
    }
    output[deployCategory].push(projectFolder);
  }
};
