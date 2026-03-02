# Creating Custom Actions

| [← Deploy to Azure][walkthrough-previous] | [Next: Reusable Workflows →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

Custom actions let you encapsulate reusable logic into a single step you can use across workflows. GitHub Actions supports three types of custom actions: **composite** (combines multiple steps), **JavaScript** (runs Node.js code), and **Docker container** (runs in a container). Composite actions are the most approachable and a great starting point for bundling common step patterns.

In this exercise you'll create a composite action that seeds the test database, then use it in your CI workflow.

## Scenario

The pet shelter's test workflows need to seed the database before running tests. This involves setting up Python, installing dependencies, and running `seed_test_database.py`. Rather than duplicating these steps in every workflow, we'll create a custom composite action that any workflow can reference in a single step.

## Understanding action metadata

Every custom action is defined by an `action.yml` file. This file describes the action's interface and behavior:

- **`name`**: A human-readable name for the action.
- **`description`**: A short summary of what the action does.
- **`inputs`**: Parameters the caller can pass to the action.
- **`outputs`**: Values the action makes available to subsequent steps.
- **`runs`**: Defines how the action executes. Composite actions use `runs.using: 'composite'` with a list of `steps`.

Inputs and outputs let the action communicate with the calling workflow, making the action flexible and reusable across different contexts.

## Create the seed-database action

Let's create a composite action that sets up Python, installs dependencies, and seeds the test database.

1. Create the directory for the action:

    ```bash
    mkdir -p .github/actions/seed-database
    ```

2. Create the file `.github/actions/seed-database/action.yml` with the following content:

    ```yaml
    name: 'Seed Test Database'
    description: 'Sets up Python, installs dependencies, and seeds the test database'

    inputs:
      python-version:
        description: 'Python version to use'
        required: false
        default: '3.12'
      database-path:
        description: 'Path to the test database file'
        required: false
        default: './test_dogshelter.db'

    outputs:
      database-file:
        description: 'Path to the seeded database file'
        value: ${{ steps.seed.outputs.database-file }}

    runs:
      using: 'composite'
      steps:
        - name: Set up Python
          uses: actions/setup-python@v5
          with:
            python-version: ${{ inputs.python-version }}

        - name: Install dependencies
          run: pip install -r server/requirements.txt
          shell: bash

        - name: Seed the database
          id: seed
          run: python server/utils/seed_test_database.py
          shell: bash
          env:
            DATABASE_PATH: ${{ inputs.database-path }}

        - name: Set output
          run: echo "database-file=${{ inputs.database-path }}" >> $GITHUB_OUTPUT
          shell: bash
          id: set-output
    ```

> [!NOTE]
> Composite action steps must include `shell: bash` for every `run` step — this is required even though it seems redundant. Without it, the workflow will fail with a validation error.

3. Review the key parts of the action:
    - **Inputs** provide sensible defaults so callers only need to override what's different.
    - **Outputs** reference the `seed` step's output, making the database path available to the calling workflow.
    - Each `run` step explicitly declares `shell: bash` as required by composite actions.

## Use the action in the CI workflow

Now let's update the CI workflow to use the custom action instead of individual steps.

1. Open your `ci.yml` workflow file and update the `test-api` job to use the custom action. Replace the individual setup, install, and seed steps with:

    ```yaml
    - name: Seed test database
      id: seed
      uses: ./.github/actions/seed-database
      with:
        python-version: ${{ matrix.python-version }}
    ```

2. You can reference the output from the action in subsequent steps. For example, to pass the database path to your test runner:

    ```yaml
    - name: Run tests
      run: python -m pytest test_app.py -v
      working-directory: ./server
      env:
        DATABASE_PATH: ${{ steps.seed.outputs.database-file }}
    ```

3. Commit and push your changes:

    ```bash
    git add .github/actions/seed-database/action.yml
    git commit -m "Add seed-database composite action"
    git push
    ```

4. Navigate to the **Actions** tab in your repository and verify the workflow runs successfully with the new action.

> [!TIP]
> When developing custom actions, you can test them by pushing to a branch and triggering a workflow run. Check the workflow logs to ensure each step in your composite action executes as expected.

## Types of custom actions

GitHub Actions supports three types of custom actions, each suited to different use cases:

| Type | Best for | Runs on | Complexity |
|------|----------|---------|------------|
| **Composite** | Bundling multiple existing steps into one | Directly on the runner | Easiest to create |
| **JavaScript** | Complex logic, API calls, or custom computations | Node.js runtime | Moderate |
| **Docker container** | Actions that need specific tools or environments | Inside a container | Most involved |

- **Composite actions** are ideal when you want to combine several existing steps (like we did with setup, install, and seed) into a single reusable unit. They're the fastest to create because they use the same step syntax you already know.
- **JavaScript actions** are best when you need custom logic, such as making API calls, processing data, or interacting with the GitHub API. They run on Node.js and have access to the `@actions/core` and `@actions/github` packages.
- **Docker container actions** are best when your action requires specific tools, operating system libraries, or a particular runtime environment. They run in a Docker container, giving you full control over the execution environment.

## Summary and next steps

Custom actions reduce duplication and make workflows cleaner. You've created a composite action that encapsulates the database seeding process into a single reusable step. Any workflow in the repository can now seed the test database with a single `uses` reference.

Next, we'll take reusability to the next level by exploring [reusable workflows][walkthrough-next] for sharing entire workflow patterns across your CI/CD pipeline.

## Resources

- [Creating a composite action][creating-composite-action]
- [About custom actions][about-custom-actions]
- [Metadata syntax for GitHub Actions][metadata-syntax]
- [GitHub Skills: Reusable workflows][skills-reusable-workflows]

| [← Deploy to Azure][walkthrough-previous] | [Next: Reusable Workflows →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

[about-custom-actions]: https://docs.github.com/en/actions/sharing-automations/creating-actions/about-custom-actions
[creating-composite-action]: https://docs.github.com/en/actions/sharing-automations/creating-actions/creating-a-composite-action
[metadata-syntax]: https://docs.github.com/en/actions/sharing-automations/creating-actions/metadata-syntax-for-github-actions
[skills-reusable-workflows]: https://github.com/skills/reusable-workflows
[walkthrough-previous]: 3-deploy-azure.md
[walkthrough-next]: 5-reusable-workflows.md
