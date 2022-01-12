# find-changed-rush-packages

Github action to detect changed Rush.js projects

## Usage

```yaml
on:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize]
jobs:
  x:
    steps:
      ...
      - name: Parse rush.json
        id: projects
        uses: telia-actions/get-rush-projects@v1
      - name: Find changed projects
        id: find_changes
        uses: telia-actions/find-changed-rush-projects@v5
        with:
          rushProjects: ${{ steps.projects.outputs.rushProjects }}
          environment: test
      ... # Build / Test / Deploy your changes using steps.find_changes.rushProjects
      - name: Add tag for change tracking
        uses: telia-actions/add-git-tag@v1
        with:
          tag-name: ${{ steps.find_changes.outputs.tag }}
          should-tag-with-timestamp: false
          commit-sha: ${{ github.event.after }}
```

## How does change detection work?

Change detection will only work on the "main" branch or in a pull request targeting the "main" branch.

We make use of tags to detect changes in code since the last _deployment_.

On the main branch, the tag is equal to the "environment" passed in by the caller. We will compare the checked-out HEAD (latest changes on main) to the existing environment tag, or detect every project as changed if there is no existing tag.

In a pull request, the tag will be "preview-x", where X is the pull request number assigned by GitHub. We will compare the head of the pull request's branch to the tag, which should be applied after successfully deploying a PR for the first time. If "preview-x" does not exist, the first comparison will be with the "main" branch.
