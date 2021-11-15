import fs from 'fs';
import { getTagSha, isChangeInPath } from './github';

export const getTagForDeployment = (pullRequestNumber: number, environment: string): string => {
  return pullRequestNumber ? `preview-${pullRequestNumber}` : environment;
};

export const getDiffTargetPullRequest = (tagName: string): string => {
  const tagSha = getTagSha(tagName);

  return tagSha ? tagName : 'origin/main';
};

export const getDiffTargetMain = (tagName: string): string | null => {
  const tagSha = getTagSha(tagName);

  return tagSha ? tagName : null;
};

export const getChangedPackages = (
  diffTarget: string,
  rushPackages: RushPackage[]
): RushPackage[] => {
  return rushPackages.reduce<RushPackage[]>((changes, _package) => {
    if (isChangeInPath(diffTarget, _package.projectFolder)) {
      updatePackageCategories(_package, changes);
    }
    return changes;
  }, []);
};

export const getAllPackages = (rushPackages: RushPackage[]): RushPackage[] => {
  return rushPackages.reduce<RushPackage[]>((changes, _package) => {
    updatePackageCategories(_package, changes);
    return changes;
  }, []);
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

const updatePackageCategories = (project: RushPackage, output: RushPackage[]): void => {
  output.push(project);
};
