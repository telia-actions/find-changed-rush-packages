import { context } from '@actions/github';
import { getTagSha } from '@src/util/git-client';

export const getPullRequestNumber = (): number => {
  return context.payload.pull_request?.number || 0;
};

export const isMainBranch = (): boolean => {
  return context.ref === 'refs/heads/main';
};

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
