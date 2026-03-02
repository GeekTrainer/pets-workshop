# Reusable Workflows

| [← Creating Custom Actions][walkthrough-previous] | [Next: Required Workflows, Protection & Wrap-Up →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

Reusable workflows let you define an entire workflow that other workflows can call, like a function. This is different from custom actions — actions encapsulate individual *steps*, while reusable workflows encapsulate entire *jobs*. They're triggered with the `workflow_call` event and can accept inputs, secrets, and produce outputs.

In this exercise you'll extract common test patterns into a reusable workflow, then call it from your CI pipeline for both the Python API and Node.js client.

## Scenario

The shelter's CI/CD pipeline has grown. The test patterns for Python and Node are similar — checkout code, set up the language runtime, install dependencies, and run tests. The deployment pattern could also be reused across environments. Rather than maintaining duplicate job definitions, let's extract these into reusable workflows that any workflow can call.

## Create a reusable test workflow

We'll create a workflow that can run tests for either Python or Node.js, depending on the inputs provided by the caller.

1. Create a new file at `.github/workflows/reusable-test.yml`.

2. Define the `workflow_call` trigger with the inputs the caller must provide:

    ```yaml
    name: Reusable Test Workflow

    on:
      workflow_call:
        inputs:
          language:
            description: 'Programming language (python or node)'
            required: true
            type: string
          language-version:
            description: 'Version of the language runtime'
            required: true
            type: string
          working-directory:
            description: 'Directory to run commands in'
            required: true
            type: string
          install-command:
            description: 'Command to install dependencies'
            required: true
            type: string
          test-command:
            description: 'Command to run tests'
            required: true
            type: string
    ```

3. Add a single job that conditionally sets up the correct language runtime and runs the provided commands:

    ```yaml
    jobs:
      test:
        runs-on: ubuntu-latest
        steps:
          - name: Checkout code
            uses: actions/checkout@v4

          - name: Set up Python
            if: inputs.language == 'python'
            uses: actions/setup-python@v5
            with:
              python-version: ${{ inputs.language-version }}

          - name: Set up Node.js
            if: inputs.language == 'node'
            uses: actions/setup-node@v4
            with:
              node-version: ${{ inputs.language-version }}

          - name: Install dependencies
            run: ${{ inputs.install-command }}
            working-directory: ${{ inputs.working-directory }}

          - name: Run tests
            run: ${{ inputs.test-command }}
            working-directory: ${{ inputs.working-directory }}
    ```

4. The complete `reusable-test.yml` file should look like:

    ```yaml
    name: Reusable Test Workflow

    on:
      workflow_call:
        inputs:
          language:
            description: 'Programming language (python or node)'
            required: true
            type: string
          language-version:
            description: 'Version of the language runtime'
            required: true
            type: string
          working-directory:
            description: 'Directory to run commands in'
            required: true
            type: string
          install-command:
            description: 'Command to install dependencies'
            required: true
            type: string
          test-command:
            description: 'Command to run tests'
            required: true
            type: string

    jobs:
      test:
        runs-on: ubuntu-latest
        steps:
          - name: Checkout code
            uses: actions/checkout@v4

          - name: Set up Python
            if: inputs.language == 'python'
            uses: actions/setup-python@v5
            with:
              python-version: ${{ inputs.language-version }}

          - name: Set up Node.js
            if: inputs.language == 'node'
            uses: actions/setup-node@v4
            with:
              node-version: ${{ inputs.language-version }}

          - name: Install dependencies
            run: ${{ inputs.install-command }}
            working-directory: ${{ inputs.working-directory }}

          - name: Run tests
            run: ${{ inputs.test-command }}
            working-directory: ${{ inputs.working-directory }}
    ```

> [!NOTE]
> Reusable workflows have a few important limitations: they can be nested up to 4 levels deep, and the workflow file must be located in the `.github/workflows` directory. You also cannot call a reusable workflow from within a reusable workflow's `steps` — they are called at the job level.

## Call the reusable workflow

Now update your `ci.yml` to call the reusable workflow instead of defining test jobs inline.

1. Replace the `test-api` job with a call to the reusable workflow:

    ```yaml
    test-api:
      uses: ./.github/workflows/reusable-test.yml
      with:
        language: python
        language-version: '3.12'
        working-directory: server
        install-command: pip install -r requirements.txt && pip install pytest
        test-command: python -m pytest test_app.py -v
    ```

2. Add a call for the client build as well:

    ```yaml
    build-client:
      uses: ./.github/workflows/reusable-test.yml
      with:
        language: node
        language-version: '20'
        working-directory: client
        install-command: npm ci
        test-command: npm run build
    ```

3. Commit and push your changes:

    ```bash
    git add .github/workflows/reusable-test.yml .github/workflows/ci.yml
    git commit -m "Extract reusable test workflow"
    git push
    ```

4. Navigate to the **Actions** tab and verify that both the `test-api` and `build-client` jobs run successfully. Notice how each appears as a separate job in the workflow visualization, even though they share the same underlying workflow definition.

> [!TIP]
> When viewing a workflow run that calls reusable workflows, GitHub shows each caller job separately. Select a job to see the steps from the reusable workflow running inside it.

## Passing secrets

Reusable workflows often need access to secrets — for example, deployment credentials or API keys. There are two approaches:

1. **Pass all secrets** using `secrets: inherit`. This forwards every secret available in the calling workflow to the reusable workflow:

    ```yaml
    deploy-staging:
      uses: ./.github/workflows/reusable-deploy.yml
      with:
        environment-name: staging
      secrets: inherit
    ```

2. **Define specific secrets** in the reusable workflow's `on.workflow_call.secrets` section for a more controlled approach:

    ```yaml
    on:
      workflow_call:
        inputs:
          environment-name:
            required: true
            type: string
        secrets:
          AZURE_CLIENT_ID:
            required: true
          AZURE_TENANT_ID:
            required: true
          AZURE_SUBSCRIPTION_ID:
            required: true
    ```

    The caller then passes each secret explicitly:

    ```yaml
    deploy-staging:
      uses: ./.github/workflows/reusable-deploy.yml
      with:
        environment-name: staging
      secrets:
        AZURE_CLIENT_ID: ${{ secrets.AZURE_CLIENT_ID }}
        AZURE_TENANT_ID: ${{ secrets.AZURE_TENANT_ID }}
        AZURE_SUBSCRIPTION_ID: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
    ```

> [!IMPORTANT]
> For deployment workflows that need Azure credentials, `secrets: inherit` is the simplest approach. However, defining specific secrets provides better documentation and prevents accidentally exposing secrets the reusable workflow doesn't need.

## Create a reusable deployment workflow

Using the same pattern, you can extract the azd deploy steps into a reusable workflow. Here's what that might look like:

1. Create `.github/workflows/reusable-deploy.yml` with inputs for the environment:

    ```yaml
    name: Reusable Deploy Workflow

    on:
      workflow_call:
        inputs:
          environment-name:
            description: 'Deployment environment (staging or production)'
            required: true
            type: string
          azd-env-name:
            description: 'Azure Developer CLI environment name'
            required: true
            type: string

    jobs:
      deploy:
        runs-on: ubuntu-latest
        environment: ${{ inputs.environment-name }}
        steps:
          - name: Checkout code
            uses: actions/checkout@v4

          - name: Install azd
            uses: Azure/setup-azd@v2

          - name: Log in with Azure (Federated Credentials)
            run: |
              azd auth login `
                --client-id "${{ secrets.AZURE_CLIENT_ID }}" `
                --federated-credential-provider "github" `
                --tenant-id "${{ secrets.AZURE_TENANT_ID }}"
            shell: pwsh

          - name: Deploy application
            run: azd deploy --environment ${{ inputs.azd-env-name }} --no-prompt
            env:
              AZURE_SUBSCRIPTION_ID: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
    ```

2. Call this workflow from your main CI/CD pipeline for both staging and production:

    ```yaml
    deploy-staging:
      needs: [test-api, build-client]
      uses: ./.github/workflows/reusable-deploy.yml
      with:
        environment-name: staging
        azd-env-name: pet-shelter-staging
      secrets: inherit

    deploy-production:
      needs: [deploy-staging]
      uses: ./.github/workflows/reusable-deploy.yml
      with:
        environment-name: production
        azd-env-name: pet-shelter-production
      secrets: inherit
    ```

This pattern keeps your deployment logic in one place. When you need to update the deployment process, you change it once in the reusable workflow and every caller benefits.

## Summary and next steps

Reusable workflows reduce duplication at the workflow level. You've extracted common test and deployment patterns into templates that any workflow can call with a single `uses` reference. This keeps your CI/CD pipeline maintainable as it grows.

Next, we'll ensure quality gates are enforced with [branch protection, required workflows, and more][walkthrough-next].

## Resources

- [Reusing workflows][reusing-workflows]
- [The `workflow_call` event][workflow-call-event]
- [Sharing workflows with your organization][sharing-workflows]
- [GitHub Skills: Reusable workflows][skills-reusable-workflows]

| [← Creating Custom Actions][walkthrough-previous] | [Next: Required Workflows, Protection & Wrap-Up →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

[reusing-workflows]: https://docs.github.com/en/actions/sharing-automations/reusing-workflows
[sharing-workflows]: https://docs.github.com/en/actions/sharing-automations/sharing-workflows-secrets-and-runners-with-your-organization
[skills-reusable-workflows]: https://github.com/skills/reusable-workflows
[workflow-call-event]: https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#workflow_call
[walkthrough-previous]: 4-custom-actions.md
[walkthrough-next]: 6-required-workflows.md
