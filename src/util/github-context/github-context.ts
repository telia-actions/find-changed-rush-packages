import { context } from '@actions/github';
import { getTagSha } from '@src/util/git-client';

export const getPullRequestNumber = (): number => {
  return context.payload.pull_request?.number || 0;
};

export const getMainDiffTarget = (): string => {
  return 'HEAD';
};

export const getPullRequestDiffTarget = (): string => {
  return context.payload.pull_request!.head.sha;
};

export const isMainBranch = (): boolean => {
  return context.ref === 'refs/heads/main';
};

export const getTagForMainDeployment = (environment: string): string => {
  return environment;
};

export const getTagForPullRequestDeployment = (pullRequestNumber: number): string => {
  return `preview-${pullRequestNumber}`;
};

export const getPullRequestDiffBase = (tagName: string): string => {
  const tagSha = getTagSha(tagName);
  return tagSha ? tagName : 'origin/main';
};

export const getMainDiffBase = (tagName: string): string | null => {
  const tagSha = getTagSha(tagName);
  return tagSha ? tagName : null;
};
