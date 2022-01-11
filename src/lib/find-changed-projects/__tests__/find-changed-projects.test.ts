import { findChangedProjects } from '../find-changed-projects'
import * as github from '@src/util/git-client/git-client';
import { rushProjects } from '../__mocks__/rushProjects';

const mockedBaseCommit = 'mockbase';
const mockedNewCommit = 'mockbase';

describe('Utilities', () => {
  describe('findChangedProjects method', () => {
    describe('given that changes exist in all packages', () => {
      beforeEach(() => {
        jest.spyOn(github, 'isPathChanged').mockReturnValue(true);
      });
      it('should have foo project path in aws deploy category', () => {
        const changedPackages = findChangedProjects(mockedBaseCommit, mockedNewCommit, rushProjects);
        const fooProject = rushProjects.find((project) => project.packageName === 'foo');
        expect(changedPackages).toContain(fooProject);
      });
    });
    describe('given that changes do not exist in any package', () => {
      beforeEach(() => {
        jest.spyOn(github, 'isPathChanged').mockReturnValue(false);
      });
      it('should return no changed projects', () => {
        const deployCategories = findChangedProjects(mockedBaseCommit, mockedNewCommit, rushProjects);
        expect(deployCategories).toHaveLength(0);
      });
    });
  });
});
