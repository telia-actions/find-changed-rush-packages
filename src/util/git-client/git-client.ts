import { info } from '@actions/core';
import { spawnSync } from 'child_process';

export const getTagSha = (tagName: string): string => {
  return spawnSync('git', ['rev-list', '-n', '1', tagName]).stdout.toString().trim();
};

/**
 * Checks whether `path` has been modified by any commits that are in `target` but not in `base`.
 * Changes made in base but not target will be ignored.
 *
 * @param base (a git ref) - The "stable" point of reference. We are looking for changes made after this point
 * @param target (a git ref) - The latest commit that we are looking for changes in.
 * @param path  (a file system path) - The path that we are checking for changes
 * @returns true if the path (or a subpath) was changed in target compared to base
 */
export const isPathChanged = (base: string, target: string, path: string): boolean => {
  info(`Diff between ${base} with ${target} for path: ${path}`);

  const { status } = spawnSync('git', ['diff', '--quiet', `${base}...${target}`, '--', path]);
  if (status === 1) return true;
  if (status === 0) return false;
  throw new Error(`Git returned a non-success code for path: ${path}`);
};
