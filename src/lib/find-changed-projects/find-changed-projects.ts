import { isPathChanged } from "@src/util/git-client";

export const findChangedProjects = (
  diffBase: string,
  diffTarget: string,
  rushProjects: RushProject[]
) => {
  const projectWasChanged = (project: RushProject) => isPathChanged(diffBase, diffTarget, project.projectFolder);
  return rushProjects.filter(projectWasChanged);
};
