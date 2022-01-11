import { context } from '@actions/github';
import {
  getPullRequestNumber,
  isMainBranch,
  getTagForPullRequestDeployment,
  getTagForMainDeployment,
  getPullRequestDiffBase,
  getMainDiffBase,
  getMainDiffTarget,
} from '../github-context';
import * as github from '@src/util/git-client/git-client';
import { getPullRequestDiffTarget } from '..';

const mockedPullRequestNumber = 1;
const mockedEnvironment = 'mockenv';
const mockedCommitSha = 'mocksha';
const mockedTagName = 'preview-1';

describe('github context utilities', () => {
  describe('getPullRequestNumber method', () => {
    describe('given that pull request exist', () => {
      it('should return pull request number', () => {
        context.payload.pull_request = {
          number: mockedPullRequestNumber,
        };
        expect(getPullRequestNumber()).toBe(mockedPullRequestNumber);
      });
    });
    describe('given that pull request does not exist', () => {
      it('should return "0"', () => {
        context.payload.pull_request = undefined;
        expect(getPullRequestNumber()).toBe(0);
      });
    });
  });
  describe('isMainBranch method', () => {
    describe('given that github reference is from main branch', () => {
      it('should return true', () => {
        context.ref = 'refs/heads/main';
        expect(isMainBranch()).toBe(true);
      });
    });
    describe('given that github reference is from feature branch', () => {
      it('should return false', () => {
        context.ref = 'refs/heads/feature--branch';
        expect(isMainBranch()).toBe(false);
      });
    });
  });
  describe('getPullRequestNumber method', () => {
    describe('given that pull request exist', () => {
      it('should return pull request number', () => {
        context.payload.pull_request = {
          number: mockedPullRequestNumber,
        };
        expect(getPullRequestNumber()).toBe(mockedPullRequestNumber);
      });
    });
    describe('given that pull request does not exist', () => {
      it('should return "0"', () => {
        context.payload.pull_request = undefined;
        expect(getPullRequestNumber()).toBe(0);
      });
    });
  });
  describe('isMainBranch method', () => {
    describe('given that github reference is from main branch', () => {
      it('should return true', () => {
        context.ref = 'refs/heads/main';
        expect(isMainBranch()).toBe(true);
      });
    });
    describe('given that github reference is from feature branch', () => {
      it('should return false', () => {
        context.ref = 'refs/heads/feature--branch';
        expect(isMainBranch()).toBe(false);
      });
    });
  });
  describe('getTagForPullRequestDeployment method', () => {
    it('should return a tag matching the current pull requests number', () => {
      const tagName = getTagForPullRequestDeployment(mockedPullRequestNumber);
      expect(tagName).toBe(`preview-${mockedPullRequestNumber}`);
    });
  });
  describe('getTagForMainDeployment method', () => {
    it('should return a tag matching the given environment name', () => {
      const tagName = getTagForMainDeployment(mockedEnvironment);
      expect(tagName).toBe(mockedEnvironment);
    });
  });
  describe('getPullRequestDiffBase method', () => {
    describe('given tag exists', () => {
      it('should return a tag', () => {
        const getTagShaSpy = jest.spyOn(github, 'getTagSha').mockReturnValue(mockedCommitSha);
        const diffTarget = getPullRequestDiffBase(mockedTagName);
        expect(getTagShaSpy).toHaveBeenCalledTimes(1);
        expect(getTagShaSpy).toHaveBeenCalledWith(mockedTagName);
        expect(diffTarget).toBe(mockedTagName);
      });
    });
    describe(`given tag doesn't exist`, () => {
      it('should return main branch fallback', () => {
        const getTagShaSpy = jest.spyOn(github, 'getTagSha').mockReturnValue('');
        const diffTarget = getPullRequestDiffBase(mockedTagName);
        expect(getTagShaSpy).toHaveBeenCalledTimes(1);
        expect(getTagShaSpy).toHaveBeenCalledWith(mockedTagName);
        expect(diffTarget).toBe('origin/main');
      });
    });
  });
  describe('getMainDiffBase method', () => {
    describe('given tag exists', () => {
      it('should return a tag', () => {
        const getTagShaSpy = jest.spyOn(github, 'getTagSha').mockReturnValue(mockedCommitSha);
        const diffTarget = getMainDiffBase(mockedTagName);
        expect(getTagShaSpy).toHaveBeenCalledTimes(1);
        expect(getTagShaSpy).toHaveBeenCalledWith(mockedTagName);
        expect(diffTarget).toBe(mockedTagName);
      });
    });
    describe(`given tag doesn't exist`, () => {
      it('should return null', () => {
        const getTagShaSpy = jest.spyOn(github, 'getTagSha').mockReturnValue('');
        const diffTarget = getMainDiffBase(mockedTagName);
        expect(getTagShaSpy).toHaveBeenCalledTimes(1);
        expect(getTagShaSpy).toHaveBeenCalledWith(mockedTagName);
        expect(diffTarget).toBe(null);
      });
    });
  });
  describe('getMainDiffTarget', () => {
    it('should return the currently checked-out commit (HEAD)', () => {
      expect(getMainDiffTarget()).toBe('HEAD');
    });
  });

  describe('getPullRequestDiffTarget', () => {
    it('should return the recently pushed commit', () => {
      context.payload.after = mockedCommitSha;
      expect(getPullRequestDiffTarget()).toBe(mockedCommitSha);
    });
  });
});
