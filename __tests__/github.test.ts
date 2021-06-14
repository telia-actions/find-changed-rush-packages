import { getTagCommitSha, getPullRequestNumber, isMainBranch, isChangeInPath } from '../src/github';
import { context } from '@actions/github';
import child_process, { SpawnSyncReturns } from 'child_process';

const mockedPullRequestNumber = 1;
const mockedCommitSha = 'mocksha';
const mockedPath = '/__mocks__';

describe('Github', () => {
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
  describe('getTagCommitSha method', () => {
    it('should call spawnSync with git rev-list command', () => {
      const spy = jest
        .spyOn(child_process, 'spawnSync')
        .mockReturnValueOnce({ stdout: Buffer.from(mockedCommitSha) } as SpawnSyncReturns<Buffer>);
      const commitSha = getTagCommitSha(`preview-${mockedPullRequestNumber}`);
      expect(commitSha).toBe(mockedCommitSha);
      expect(spy).toHaveBeenCalledWith('git', [
        'rev-list',
        '-n',
        '1',
        `preview-${mockedPullRequestNumber}`,
      ]);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
  describe('isChangeInPath method', () => {
    it('should call spawnSync with git diff command', () => {
      const spy = jest
        .spyOn(child_process, 'spawnSync')
        .mockReturnValueOnce({ status: 0 } as SpawnSyncReturns<Buffer>);
      isChangeInPath(mockedCommitSha, mockedPath);
      expect(spy).toHaveBeenCalledWith('git', [
        'diff',
        '--quiet',
        mockedCommitSha,
        '--',
        mockedPath,
      ]);
      expect(spy).toHaveBeenCalledTimes(1);
    });
    describe('given that git diff status is 0', () => {
      it('should return false', () => {
        jest
          .spyOn(child_process, 'spawnSync')
          .mockReturnValueOnce({ status: 0 } as SpawnSyncReturns<Buffer>);
        const isChanged = isChangeInPath(mockedCommitSha, mockedPath);
        expect(isChanged).toBe(false);
      });
    });
    describe('given that git diff status is 1', () => {
      it('should return true', () => {
        jest
          .spyOn(child_process, 'spawnSync')
          .mockReturnValueOnce({ status: 1 } as SpawnSyncReturns<Buffer>);
        const isChanged = isChangeInPath(mockedCommitSha, mockedPath);
        expect(isChanged).toBe(true);
      });
    });
  });
});
