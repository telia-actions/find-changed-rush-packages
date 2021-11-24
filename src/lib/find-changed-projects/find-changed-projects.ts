import { isChangeInPath } from "@src/util/git-client";

export const findChangedProjects = (
  diffTarget: string,
  rushProjects: RushProject[]
) => {
  return rushProjects.reduce<RushProject[]>((changes, project) => {
    if (isChangeInPath(diffTarget, project.projectFolder)) {
      changes.push(project)
    }
    return changes;
  }, []);
};
