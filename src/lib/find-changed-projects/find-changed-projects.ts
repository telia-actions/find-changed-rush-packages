import { isPathChanged } from "@src/util/git-client";

export const findChangedProjects = (
  diffBase: string,
  diffTarget: string,
  rushProjects: RushProject[]
) => {
  return rushProjects.filter(({ projectFolder }) => isPathChanged(diffBase, diffTarget, projectFolder));
};
