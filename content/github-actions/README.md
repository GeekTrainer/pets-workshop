# GitHub Actions: From CI to CD

| [← Pets workshop selection][walkthrough-previous] | [Next: Introduction & Your First CI Workflow →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

[GitHub Actions][github-actions] is a powerful automation platform built into every GitHub repository. With Actions you can build, test, and deploy your code — and automate just about anything else in your software development lifecycle. This workshop walks you through building a complete CI/CD pipeline, starting with running tests on every push and ending with automated deployment to Azure.

You'll work with the pet shelter application — a [Flask][flask] API and [Astro][astro] frontend — and progressively build out workflows that reflect real-world CI/CD practices.

## Prerequisites

To complete this workshop, you will need the following:

- A [GitHub account][github-signup]
- A repository with the pet shelter application code (created from the [template repository][repo-root])
- An [Azure subscription][azure-free] (for the deployment exercises)
- Familiarity with Git basics (commit, push, pull)

> [!NOTE]
> If you have access to [GitHub Copilot][github-copilot], it can help you write workflow YAML files. You'll see tips throughout the exercises on how to use it effectively.

## Exercises

0. [Introduction & Your First CI Workflow][introduction] — Create your first workflow to run tests automatically
1. [The Marketplace & Caching][marketplace] — Discover pre-built actions and speed up your workflows
2. [Matrix Strategies & Parallel Testing][matrix] — Test across multiple configurations simultaneously
3. [Deploying to Azure with azd][deployment] — Set up continuous deployment to Azure
4. [Creating Custom Actions][custom-actions] — Build your own reusable action
5. [Reusable Workflows][reusable-workflows] — Share workflow logic across repositories
6. [Required Workflows, Protection & Wrap-Up][protection] — Enforce standards and protect your branches

## Resources

- [GitHub Actions documentation][github-actions-docs]
- [GitHub Actions Marketplace][actions-marketplace]
- [Workflow syntax reference][workflow-syntax]
- [Azure Developer CLI (azd) documentation][azd-docs]

| [← Pets workshop selection][walkthrough-previous] | [Next: Introduction & Your First CI Workflow →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

[actions-marketplace]: https://github.com/marketplace?type=actions
[astro]: https://astro.build/
[azure-free]: https://azure.microsoft.com/free/
[azd-docs]: https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/overview
[custom-actions]: ./4-custom-actions.md
[deployment]: ./3-deploy-azure.md
[flask]: https://flask.palletsprojects.com/
[github-actions]: https://github.com/features/actions
[github-actions-docs]: https://docs.github.com/en/actions
[github-copilot]: https://github.com/features/copilot
[github-signup]: https://github.com/join
[introduction]: ./0-introduction.md
[marketplace]: ./1-marketplace-and-caching.md
[matrix]: ./2-matrix-strategies.md
[protection]: ./6-required-workflows.md
[repo-root]: /
[reusable-workflows]: ./5-reusable-workflows.md
[walkthrough-next]: ./0-introduction.md
[walkthrough-previous]: ../README.md
[workflow-syntax]: https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions
