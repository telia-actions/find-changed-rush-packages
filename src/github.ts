import { context } from '@actions/github';
import { spawnSync } from 'child_process';

export const getPullRequestNumber = (): number => {
  return context.payload.pull_request?.number || 0;
};

export const isMainBranch = (): boolean => {
  return context.ref === 'refs/heads/main';
};

export const getTagSha = (tagName: string): string => {
  return spawnSync('git', ['rev-list', '-n', '1', tagName]).stdout.toString().trim();
};

export const isChangeInPath = (target: string, path: string): boolean => {
  return Boolean(spawnSync('git', ['diff', '--quiet', `${target}...`, '--', path]).status);
};
