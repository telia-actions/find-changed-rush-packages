import { spawnSync } from 'child_process';

export const getTagSha = (tagName: string): string => {
  return spawnSync('git', ['rev-list', '-n', '1', tagName]).stdout.toString().trim();
};

export const isChangeInPath = (target: string, path: string): boolean => {
  const { status } = spawnSync('git', ['diff', '--quiet', `${target}...`, '--', path]);
  if (status === 1) return true;
  if (status === 0) return false;
  throw new Error(`Git returned a non-success code for path: ${path}`);
};
