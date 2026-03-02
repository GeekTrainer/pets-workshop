# Introduction & Your First CI Workflow

| [← GitHub Actions: From CI to CD][walkthrough-previous] | [Next: The Marketplace & Caching →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

**Estimated time: 25 minutes**

[GitHub Actions][github-actions] is an automation platform built into GitHub that lets you build, test, and deploy your code directly from your repository. While it's most commonly used for CI/CD, it can automate just about any task in your development workflow — from labeling issues to resizing images.

Before diving in, here are the key terms you'll encounter:

- **Workflow**: An automated process defined in a YAML file, stored in `.github/workflows/`.
- **Event**: A trigger that starts a workflow, such as a `push`, `pull_request`, or `workflow_dispatch`.
- **Job**: A set of steps that run on the same runner. Jobs run in parallel by default.
- **Step**: An individual task within a job — either a shell command (`run`) or a reusable action (`uses`).
- **Runner**: The virtual machine that executes your jobs (e.g., `ubuntu-latest`).
- **Action**: A reusable unit of code that performs a specific task, published on the [Actions Marketplace][actions-marketplace].

## Scenario

The shelter has built its application — a Flask API and Astro frontend — and now needs to automate testing to catch issues before they reach production. The goal is to ensure tests run on every push and pull request so that broken code never makes it to the main branch unnoticed.

## Understanding GitHub Actions

A workflow file is written in YAML and lives in the `.github/workflows/` directory. Here are the core sections you'll work with:

- `name`: A human-readable name for the workflow, displayed in the **Actions** tab.
- `on`: Defines the events that trigger the workflow (e.g., `push`, `pull_request`).
- `jobs`: Contains one or more jobs, each with a unique identifier.
  - `runs-on`: Specifies the runner environment (e.g., `ubuntu-latest`).
  - `steps`: An ordered list of tasks the job performs.
    - `uses`: References a reusable action (e.g., `actions/checkout@v4`).
    - `run`: Executes a shell command.

## Create the CI workflow

Let's create your first workflow to run the API tests automatically.

> [!TIP]
> If you have GitHub Copilot, try asking it to generate a GitHub Actions workflow for running Python tests. You can compare its output with the steps below!

1. In your repository, create the folder `.github/workflows/` if it doesn't already exist.
2. Create a new file named `.github/workflows/ci.yml`.
3. Add the following content:

    ```yaml
    name: CI

    on:
      push:
        branches: [main]
      pull_request:
        branches: [main]

    jobs:
      test-api:
        runs-on: ubuntu-latest

        steps:
          - uses: actions/checkout@v4

          - name: Set up Python
            uses: actions/setup-python@v5
            with:
              python-version: '3.12'

          - name: Install dependencies
            run: |
              python -m pip install --upgrade pip
              pip install -r server/requirements.txt
              pip install pytest

          - name: Run tests
            working-directory: ./server
            run: |
              python -m pytest test_app.py -v
    ```

4. Save the file.

> [!NOTE]
> The workflow triggers on both `push` to main and `pull_request` targeting main. This ensures tests run whether you push directly or open a PR.

## Push and explore

Now let's push the workflow and see it in action.

1. Stage and commit your changes:

    ```bash
    git add .github/workflows/ci.yml
    git commit -m "Add CI workflow"
    ```

2. Push to your repository:

    ```bash
    git push
    ```

3. Navigate to your repository on GitHub and select the **Actions** tab.
4. You should see the **CI** workflow running. Select it to view the details.
5. Select the **test-api** job to explore the logs for each step — you'll see the checkout, Python setup, dependency installation, and test results.

## Add a build job

With the API tests passing, let's add a job to build the frontend client.

1. Open `.github/workflows/ci.yml` and add the following job below `test-api`:

    ```yaml
      build-client:
        runs-on: ubuntu-latest
        needs: test-api

        steps:
          - uses: actions/checkout@v4

          - name: Set up Node.js
            uses: actions/setup-node@v4
            with:
              node-version: '20'

          - name: Install dependencies
            working-directory: ./client
            run: npm ci

          - name: Build client
            working-directory: ./client
            run: npm run build
    ```

    > [!NOTE]
    > The `needs: test-api` line creates a dependency — `build-client` will only run after `test-api` completes successfully. Remove this line if you'd prefer both jobs to run in parallel.

2. Save the file.
3. Stage, commit, and push:

    ```bash
    git add .github/workflows/ci.yml
    git commit -m "Add client build job to CI workflow"
    git push
    ```

4. Return to the **Actions** tab and observe both jobs. If you used `needs`, you'll see them run sequentially; otherwise they'll run in parallel.

## Summary and next steps

Congratulations! You've created your first CI workflow with GitHub Actions. Tests now run automatically on every push and pull request, and the client is built to verify there are no build errors. This is the foundation of continuous integration — catching problems early so they don't reach production.

Next, we'll explore the [Actions Marketplace][walkthrough-next] to discover pre-built actions and speed up our workflow with caching.

### Resources

- [GitHub Actions documentation][github-actions-docs]
- [Workflow syntax for GitHub Actions][workflow-syntax]
- [Events that trigger workflows][workflow-triggers]
- [Understanding GitHub Actions][understanding-actions]

| [← GitHub Actions: From CI to CD][walkthrough-previous] | [Next: The Marketplace & Caching →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

[actions-marketplace]: https://github.com/marketplace?type=actions
[github-actions]: https://github.com/features/actions
[github-actions-docs]: https://docs.github.com/en/actions
[understanding-actions]: https://docs.github.com/en/actions/about-github-actions/understanding-github-actions
[workflow-syntax]: https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions
[workflow-triggers]: https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows
[walkthrough-previous]: README.md
[walkthrough-next]: 1-marketplace-and-caching.md
