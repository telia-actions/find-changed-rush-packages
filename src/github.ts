import { context } from '@actions/github';
import { spawnSync } from 'child_process';

export const getPullRequestNumber = (): number => {
  return context.payload.pull_request?.number || 0;
};

export const isMainBranch = (): boolean => {
  return context.ref === 'refs/heads/main';
};

export const getTagCommitSha = (tagName: string): string => {
  return spawnSync('git', ['rev-list', '-n', '1', tagName]).stdout.toString().trim();
};

export const isChangeInPath = (commitSha: string, path: string): boolean => {
  return spawnSync('git', ['diff', '--quiet', commitSha, '--', path]).status ? true : false;
};
