# Required Workflows, Protection & Wrap-Up

| [← Reusable Workflows][walkthrough-previous] | [Next: GitHub Actions section overview →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

Building a CI/CD pipeline is only half the battle — you also need to enforce it. Branch protection rules ensure that code can't be merged without passing checks. Required workflows go further, allowing organizations to mandate specific workflows across all repositories. In this final exercise, you'll configure branch protection, explore required workflows and rulesets, and add manual deployment triggers.

## Scenario

The shelter's CI/CD pipeline is comprehensive, but nothing currently prevents someone from merging code without passing CI — meaning untested code could reach `main` and trigger a deployment. The organization also wants to ensure all repositories run security scanning. Let's lock things down with branch protection and explore how required workflows enforce standards at scale.

## Background

GitHub provides two mechanisms for enforcing rules on branches: **branch protection rules** and **repository rulesets**. Both can prevent code from being merged without meeting criteria you define, but they work differently.

### Branch protection rules

[Branch protection rules][about-protected-branches] are the original way to protect important branches. You configure them per-branch (e.g. `main`) to enforce requirements like:

- **Required status checks** — CI must pass before merging.
- **Required pull request reviews** — a minimum number of approvals before merging.
- **Restrict who can push** — limit direct pushes to specific people or teams.

Branch protection rules are available on all GitHub plans (including Free for public repos) and are configured at **Settings > Branches** in each repository.

### Repository rulesets

[Rulesets][about-rulesets] are the newer, more flexible approach. They offer several advantages over branch protection rules:

| | Branch Protection Rules | Repository Rulesets |
|---|---|---|
| **Layering** | One rule per branch pattern | Multiple rulesets can apply to the same branch; the most restrictive rule wins |
| **Status management** | Delete to disable | Toggle between **Active** and **Disabled** without losing configuration |
| **Visibility** | Only admins can view | Anyone with read access can see active rulesets |
| **Scope** | Repository-level only | Repository-level or organization-wide (GitHub Enterprise) |
| **Bypass permissions** | Limited | Granular bypass for specific roles, teams, or GitHub Apps |
| **Required workflows** | Not supported | Can require specific workflows to pass before merging |

Rulesets and branch protection rules can coexist — when both apply to the same branch, their rules are aggregated and the most restrictive version of each rule applies.

### Required workflows

One of the most powerful ruleset features is the ability to **require specific workflows to pass before merging**. This is particularly useful at the organization level:

1. An organization creates a reusable workflow (e.g. `security-scan.yml`) in a central repository.
2. An organization-wide ruleset requires that workflow for all (or a subset of) repositories.
3. Every PR across those repositories now runs the required workflow automatically — individual repository owners can't skip it.

Common use cases include security scanning, license compliance, and code quality checks. Required workflows via rulesets replaced the earlier "Actions Required Workflows" feature, which was deprecated in October 2023.

## Configure branch protection

Branch protection rules prevent code from being merged into important branches without meeting specific criteria.

1. Navigate to your repository on GitHub.
2. Select **Settings** > **Branches** (under **Code and automation** in the sidebar).
3. Select **Add branch protection rule** (or **Add rule** if using rulesets).
4. Under **Branch name pattern**, enter `main`.
5. Enable **Require status checks to pass before merging**.
    - Select **Require branches to be up to date before merging**.
    - In the search box, search for and select your CI workflow status check names (for example, `test-api` and `build-client`).
6. Optionally enable **Require a pull request before merging** to ensure peer review.
7. Select **Create** (or **Save changes**) to apply the rule.

> [!TIP]
> If your status checks don't appear in the search, make sure the CI workflow has run at least once on the repository. GitHub only shows status checks that have been reported previously.

## Test the protection

Let's verify that branch protection is working as expected.

1. Return to your codespace and open the terminal (<kbd>Ctl</kbd>+<kbd>`</kbd> to toggle). Create a new branch and make a small change (for example, update a comment in `server/app.py`):

    ```bash
    git checkout -b test-protection
    echo "# test change" >> server/app.py
    git add server/app.py
    git commit -m "Test branch protection"
    git push -u origin test-protection
    ```

2. Navigate to your repository on GitHub and create a pull request from `test-protection` to `main`.
3. Observe that the **Merge pull request** button is disabled and a message indicates that required status checks must pass.
4. Watch the CI workflow run. Once all required checks pass, the merge button becomes enabled.
5. You can merge or close the pull request — the important thing is that the protection is working!

> [!IMPORTANT]
> Branch protection ensures that your CI pipeline isn't just a suggestion — it's a requirement. Code cannot reach `main` without passing the checks you've defined.

## Required workflows in practice

As covered in the background section, organization-wide rulesets can mandate that specific workflows run across all repositories. This pairs naturally with the reusable workflows you built in the [previous exercise](8-reusable-workflows.md) — an organization could create a reusable security-scanning workflow in a central `.github` repository, then enforce it via a ruleset so every PR across the organization runs it automatically.

> [!NOTE]
> Organization-wide rulesets with required workflows require a GitHub Enterprise plan. For personal repositories or Free/Team organizations, repository-level branch protection (as configured above) provides similar enforcement.

## Advanced features to explore

Here are some additional GitHub Actions features you can explore on your own:

- **Service containers**: Spin up databases, caches, or other services alongside your test jobs. Define them under `services` in a job, and GitHub Actions handles the lifecycle for you.
- **Job summaries**: Write Markdown to the `$GITHUB_STEP_SUMMARY` environment file to create rich, formatted output that appears on the workflow run summary page.
- **Self-hosted runners**: Run workflows on your own infrastructure for specialized hardware needs, compliance requirements, or to stay within your network. Useful when you need GPUs, specific OS versions, or access to internal resources.
- **`repository_dispatch`**: Trigger workflows from external events via the GitHub API. This is useful for integrating GitHub Actions with external systems like monitoring tools, chatbots, or other CI/CD platforms.

## Wrap-up and congratulations

Congratulations! You've built a complete CI/CD pipeline for the pet shelter application. Let's review what you've accomplished:

- **Continuous integration**: Tests run on every push and pull request across multiple Python versions, catching bugs before they reach `main`.
- **Continuous deployment**: Automated deployment to Azure via `azd`, triggered after CI passes on `main`.
- **Custom actions**: Encapsulated Python setup and database seeding into a reusable composite action, eliminating duplication across jobs.
- **Reusable workflows**: Extracted the deployment pattern into a callable workflow template, shared by both the automated CD pipeline and a manual deploy workflow for rollbacks.
- **Manual deployment**: Added on-demand deployment capability for rollbacks and hotfixes, using `workflow_dispatch` with a git ref input.
- **Branch protection**: Enforced quality gates so code can't be merged without passing CI checks — the production safeguard that ensures only validated code gets deployed.

This pipeline follows the same patterns used by teams across GitHub. As the shelter's application grows, this foundation will scale with it.

### Continue learning

If you want to keep exploring, here are some suggested next steps:

- Add a code scanning workflow using [GitHub Advanced Security][github-security].
- Explore [GitHub Environments][environments-docs] with deployment protection rules for staged deployments (e.g., staging → production with manual approval).
- Explore the [GitHub Actions Marketplace][actions-marketplace] for community-built actions.
- Take the [GitHub Skills: Deploy to Azure][skills-deploy-azure] course for a deeper dive into Azure deployment.

## Resources

- [About protected branches][about-protected-branches]
- [About rulesets][about-rulesets]
- [Required workflows][required-workflows]
- [The `workflow_dispatch` event][workflow-dispatch]
- [GitHub Skills: Deploy to Azure][skills-deploy-azure]
- [GitHub Actions Marketplace][actions-marketplace]

| [← Reusable Workflows][walkthrough-previous] | [Next: GitHub Actions section overview →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

[about-protected-branches]: https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
[about-rulesets]: https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets
[actions-marketplace]: https://github.com/marketplace?type=actions
[environments-docs]: https://docs.github.com/actions/managing-workflow-runs-and-deployments/managing-deployments/managing-environments-for-deployment
[github-security]: https://github.com/features/security
[required-workflows]: https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets
[skills-deploy-azure]: https://github.com/skills/deploy-to-azure
[workflow-dispatch]: https://docs.github.com/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#workflow_dispatch
[walkthrough-previous]: 8-reusable-workflows.md
[walkthrough-next]: README.md
