# Required Workflows, Protection & Wrap-Up

| [← Reusable Workflows][walkthrough-previous] | [Next: GitHub Actions section overview →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

Building a CI/CD pipeline is only half the battle — you also need to enforce it. Branch protection rules ensure that code can't be merged without passing checks. Required workflows go further, allowing organizations to mandate specific workflows across all repositories. In this final exercise, you'll configure branch protection, explore required workflows and rulesets, and add manual deployment triggers.

## Scenario

The shelter's CI/CD pipeline is comprehensive, but nothing currently prevents someone from merging code without passing CI. The organization also wants to ensure all repositories run security scanning. Let's lock things down with branch protection and explore how required workflows enforce standards at scale.

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

1. Create a new branch and make a small change (for example, update a comment in `server/app.py`):

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

## Required workflows and rulesets

While branch protection works at the repository level, organizations often need to enforce workflows across *all* repositories. This is where **repository rulesets** come in.

- At the organization level, admins can create **rulesets** that mandate specific workflows for all (or a subset of) repositories.
- These required workflows run automatically on any pull request or push event, regardless of what each repository has configured.
- Common use cases include security scanning, license compliance, and code quality checks.
- This combines powerfully with reusable workflows: the organization creates a reusable workflow in a central repository, then requires it via a ruleset.

For example, an organization might:
1. Create a `security-scan.yml` reusable workflow in a `.github` repository.
2. Create a ruleset that requires this workflow for all repositories.
3. Every PR across the organization now runs the security scan automatically.

> [!NOTE]
> Required workflows via rulesets is an organization-level feature. If you're working in a personal repository, you can still use branch protection rules (as configured above) for similar enforcement at the repository level.

## Adding manual triggers

Sometimes you need to trigger a deployment on demand — for example, to perform a rollback or deploy a hotfix. The `workflow_dispatch` event adds a manual trigger to any workflow.

1. Add `workflow_dispatch` to your deployment workflow with an input for the target environment:

    ```yaml
    on:
      workflow_dispatch:
        inputs:
          environment:
            description: 'Target environment'
            required: true
            type: choice
            options:
              - staging
              - production
    ```

2. Reference the input in your job:

    ```yaml
    jobs:
      deploy:
        runs-on: ubuntu-latest
        environment: ${{ inputs.environment }}
        steps:
          - name: Deploy
            run: echo "Deploying to ${{ inputs.environment }}"
    ```

3. To trigger the workflow manually:
    - Navigate to the **Actions** tab in your repository.
    - Select the workflow from the left sidebar.
    - Select **Run workflow**.
    - Choose the target environment from the dropdown and select **Run workflow**.

4. Commit and push the updated workflow file. The **Run workflow** button will appear on the workflow's page once the change reaches the default branch.

> [!TIP]
> Manual triggers with `workflow_dispatch` are useful for rollbacks, on-demand deployments, and one-off maintenance tasks. You can define multiple inputs with different types including `string`, `boolean`, `choice`, and `environment`.

## Advanced features to explore

Here are some additional GitHub Actions features you can explore on your own:

- **Service containers**: Spin up databases, caches, or other services alongside your test jobs. Define them under `services` in a job, and GitHub Actions handles the lifecycle for you.
- **Job summaries**: Write Markdown to the `$GITHUB_STEP_SUMMARY` environment file to create rich, formatted output that appears on the workflow run summary page.
- **Self-hosted runners**: Run workflows on your own infrastructure for specialized hardware needs, compliance requirements, or to stay within your network. Useful when you need GPUs, specific OS versions, or access to internal resources.
- **`repository_dispatch`**: Trigger workflows from external events via the GitHub API. This is useful for integrating GitHub Actions with external systems like monitoring tools, chatbots, or other CI/CD platforms.

## Wrap-up and congratulations

Congratulations! You've built a complete CI/CD pipeline for the pet shelter application. Let's review what you've accomplished:

- **Continuous integration**: Tests run on every push and pull request across multiple Python versions, catching bugs before they reach `main`.
- **Continuous deployment**: Automated deployment to Azure via `azd`, with staging and production environments.
- **Custom actions**: Encapsulated the database seeding process into a reusable composite action, eliminating duplication.
- **Reusable workflows**: Extracted common test and deployment patterns into callable workflow templates.
- **Branch protection**: Enforced quality gates so code can't be merged without passing CI checks.
- **Manual triggers**: Added on-demand deployment capability for rollbacks and hotfixes.

This pipeline follows the same patterns used by teams across GitHub. As the shelter's application grows, this foundation will scale with it.

### Continue learning

If you want to keep exploring, here are some suggested next steps:

- Add a code scanning workflow using [GitHub Advanced Security][github-security].
- Implement environment-based deployment approvals using [GitHub Environments][environments-docs].
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

[about-protected-branches]: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
[about-rulesets]: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets
[actions-marketplace]: https://github.com/marketplace?type=actions
[environments-docs]: https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-deployments/managing-environments-for-deployment
[github-security]: https://github.com/features/security
[required-workflows]: https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-workflow-runs/required-workflows
[skills-deploy-azure]: https://github.com/skills/deploy-to-azure
[workflow-dispatch]: https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#workflow_dispatch
[walkthrough-previous]: 5-reusable-workflows.md
[walkthrough-next]: README.md
