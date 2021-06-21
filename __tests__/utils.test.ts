import {
  getAllPackages,
  getChangedPackages,
  getLastDeployedRef,
  getTagForDeployment,
  readJson,
} from '../src/utils';
import * as github from '../src/github';
import mockedRushJson from '../__mocks__/rush';

jest.mock('@actions/core');

const mockedCommitSha = 'mocksha';
const mockedEnvironment = 'mockenv';
const mockedPullRequestNumber = 1;
const mockedTagName = 'preview-1';

describe('Utilities', () => {
  describe('readRushJson method', () => {
    describe('given that rush.json exist', () => {
      it('should return valid rush.json file', () => {
        const rushJson = readJson('./__mocks__/rush.json');
        expect(rushJson).toEqual(mockedRushJson);
      });
    });
    describe('given that rush.json does not exist', () => {
      it('should throw an error', () => {
        expect(() => readJson('')).toThrowError('ENOENT: no such file or directory, open');
      });
    });
  });
  describe('getTagForDeployment method', () => {
    describe('given that we are on the main branch', () => {
      beforeEach(() => {
        jest.spyOn(github, 'isMainBranch').mockReturnValue(true);
        jest.spyOn(github, 'getPullRequestNumber').mockReturnValue(0);
      });
      it('should return a tag matching the given environment name', () => {
        const tagName = getTagForDeployment(mockedEnvironment);
        expect(tagName).toBe(mockedEnvironment);
      });
    });
    describe('given that we are in a branch which is part of a pull request', () => {
      beforeEach(() => {
        jest.spyOn(github, 'isMainBranch').mockReturnValue(false);
        jest.spyOn(github, 'getPullRequestNumber').mockReturnValue(mockedPullRequestNumber);
      });
      it('should return a tag matching the current pull requests number', () => {
        const tagName = getTagForDeployment(mockedEnvironment);
        expect(tagName).toBe(`preview-${mockedPullRequestNumber}`);
      });
    });
    describe('given that we are in a non-main branch with no related pull request', () => {
      beforeEach(() => {
        jest.spyOn(github, 'isMainBranch').mockReturnValue(false);
        jest.spyOn(github, 'getPullRequestNumber').mockReturnValue(0);
      });
      it('should throw an error', () => {
        expect(() => getTagForDeployment(mockedEnvironment)).toThrow();
      });
    });
  });
  describe('getLastDeployedRef method', () => {
    describe('when we deploy a preview of a pull request', () => {
      describe('given that it has been deployed before', () => {
        beforeEach(() => {
          jest.spyOn(github, 'getTagSha').mockImplementation((tagName) => {
            if (tagName === mockedTagName) {
              return mockedCommitSha;
            }
            return '';
          });
        });
        it('should return the SHA of the previously deployed commit', () => {
          const deployedRef = getLastDeployedRef(mockedEnvironment, mockedTagName);
          expect(deployedRef).toBe(mockedCommitSha);
        });
      });
      describe('given that it has not been deployed before', () => {
        describe('but is based on an environment that has been deployed', () => {
          beforeEach(() => {
            jest.spyOn(github, 'getTagSha').mockImplementation((tagName) => {
              if (tagName === mockedTagName) {
                return '';
              } else if (tagName === mockedEnvironment) {
                return mockedCommitSha;
              }
              return '';
            });
          });
          it('should return the SHA of the commit that was deployed to that environment', () => {
            const deployedRef = getLastDeployedRef(mockedEnvironment, mockedTagName);
            expect(deployedRef).toBe(mockedCommitSha);
          });
        });
        describe('and is based on an environment that has not been deployed either', () => {
          beforeEach(() => {
            jest.spyOn(github, 'getTagSha').mockReturnValue('');
          });
          it('should return an empty string', () => {
            const deployedRef = getLastDeployedRef(mockedEnvironment, mockedTagName);
            expect(deployedRef).toBe('');
          });
        });
      });
    });
    describe('given that we are deploying the main branch to an environment', () => {
      describe('given that this is the first deployment to the environment', () => {
        beforeEach(() => {
          jest.spyOn(github, 'getTagSha').mockReturnValue('');
        });
        it('should return an empty string', () => {
          const deployedRef = getLastDeployedRef(mockedEnvironment, mockedEnvironment);
          expect(deployedRef).toBe('');
        });
      });
      describe('given that there have been deployments to the environment already', () => {
        beforeEach(() => {
          jest.spyOn(github, 'getTagSha').mockImplementation((tagName) => {
            if (tagName === mockedEnvironment) {
              return mockedCommitSha;
            }
            return '';
          });
        });
        it('should return the SHA of the commit that was deployed to that environment', () => {
          const deployedRef = getLastDeployedRef(mockedEnvironment, mockedEnvironment);
          expect(deployedRef).toBe(mockedCommitSha);
        });
      });
    });
  });
  describe('getChangedPackages method', () => {
    describe('given that changes exists for all packages', () => {
      beforeEach(() => {
        jest.spyOn(github, 'isChangeInPath').mockReturnValue(true);
      });
      it('should have foo project path in aws deploy category', () => {
        const deployCategories = getChangedPackages(mockedCommitSha, mockedRushJson.projects);
        const fooProject = mockedRushJson.projects.find((project) => project.packageName === 'foo');
        expect(deployCategories.aws).toContain(fooProject?.projectFolder);
      });
      it('should have bar project path in k8s deploy category', () => {
        const deployCategories = getChangedPackages(mockedCommitSha, mockedRushJson.projects);
        const barProject = mockedRushJson.projects.find((project) => project.packageName === 'bar');
        expect(deployCategories.k8s).toContain(barProject?.projectFolder);
      });
    });
    describe('given that changes does not exists in any package', () => {
      beforeEach(() => {
        jest.spyOn(github, 'isChangeInPath').mockReturnValue(false);
      });
      it('should not have foo project path in aws deploy category', () => {
        const deployCategories = getChangedPackages(mockedCommitSha, mockedRushJson.projects);
        const fooProject = mockedRushJson.projects.find((project) => project.packageName === 'foo');
        expect(deployCategories.aws).not.toContain(fooProject?.projectFolder);
      });
      it('should not have bar project path in k8s deploy category', () => {
        const deployCategories = getChangedPackages(mockedCommitSha, mockedRushJson.projects);
        const barProject = mockedRushJson.projects.find((project) => project.packageName === 'bar');
        expect(deployCategories.k8s).not.toContain(barProject?.projectFolder);
      });
    });
  });
  describe('getAllPackages method', () => {
    it('should have foo project path in aws deploy category', () => {
      const deployCategories = getAllPackages(mockedRushJson.projects);
      const fooProject = mockedRushJson.projects.find((project) => project.packageName === 'foo');
      expect(deployCategories.aws).toContain(fooProject?.projectFolder);
    });
    it('should have bar project path in k8s deploy category', () => {
      const deployCategories = getAllPackages(mockedRushJson.projects);
      const barProject = mockedRushJson.projects.find((project) => project.packageName === 'bar');
      expect(deployCategories.k8s).toContain(barProject?.projectFolder);
    });
  });
});
