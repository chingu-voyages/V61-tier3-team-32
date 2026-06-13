# Branching and Merging Rules

To maintain code quality and stability, we follow a strict branching strategy. The `main` branch is protected, and all changes must go through the `development` branch via Pull Requests (PRs).

## Branch Strategy

- **`main`**: Production-ready code. No direct commits allowed.
- **`development`**: Integration branch. All features, fixes, and chores are merged here first before making their way to `main`.
- **Feature Branches**: Branch off from `development` using the format `feature/<your-feature-name>`.
- **Bug Fix Branches**: Branch off from `development` using the format `fix/<bug-name>`.

## Pull Request (PR) Rules

Before a PR can be merged into the `main` branch (or `development` branch), the following rules apply:

1. **Approval Required**: 
   - At least **1 approval** from a team member is required before merging.
   - The PR author cannot approve their own PR.
2. **Status Checks Must Pass**: 
   - The CI/CD pipeline (GitHub Actions) must pass without errors (no ESLint errors, builds successfully).
3. **Resolve Conversations**: 
   - All review comments and requested changes must be resolved before merging.
4. **Up-to-Date Branches**: 
   - The PR branch must be up to date with the base branch (`main` or `development`) before merging.

## How to Configure These Rules in GitHub

Since branch protection rules are enforced by GitHub (not local code), a Repo Admin must configure them in the repository settings:

1. Go to your repository on GitHub.
2. Click on **Settings** > **Branches**.
3. Under **Branch protection rules**, click **Add branch protection rule**.
4. In the **Branch name pattern**, type `main`.
5. Check the following boxes:
   - **Require a pull request before merging**
     - Check **Require approvals** (Set required number of approvals to 1).
   - **Require status checks to pass before merging** (Select your CI workflow action).
   - **Require conversation resolution before merging**.
   - **Do not allow bypassing the above settings**.
6. Click **Create** at the bottom.
7. Repeat the same process for the `development` branch.
