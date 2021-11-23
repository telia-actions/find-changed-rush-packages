import { findChangedProjects } from '../find-changed-projects'
import * as github from '@src/util/git-client/git-client';
import { rushProjects } from '../__mocks__/rushProjects';

const mockedCommitSha = 'mocksha';

describe('Utilities', () => {
  describe('findChangedProjects method', () => {
    describe('given that changes exists for all packages', () => {
      beforeEach(() => {
        jest.spyOn(github, 'isChangeInPath').mockReturnValue(true);
      });
      it('should have foo project path in aws deploy category', () => {
        const changedPackages = findChangedProjects(mockedCommitSha, rushProjects);
        const fooProject = rushProjects.find((project) => project.packageName === 'foo');
        expect(changedPackages).toContain(fooProject);
      });
    });
    describe('given that changes does not exists in any package', () => {
      beforeEach(() => {
        jest.spyOn(github, 'isChangeInPath').mockReturnValue(false);
      });
      it('should return no changed projects', () => {
        const deployCategories = findChangedProjects(mockedCommitSha, rushProjects);
        expect(deployCategories).toHaveLength(0);
      });
    });
  });
});
