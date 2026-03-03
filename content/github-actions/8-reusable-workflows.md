# Reusable Workflows

| [← Creating Custom Actions][walkthrough-previous] | [Next: Required Workflows, Protection & Wrap-Up →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

Reusable workflows let you define an entire workflow that other workflows can call, like a function. This is different from custom actions — actions encapsulate individual *steps*, while reusable workflows encapsulate entire *jobs*. They're triggered with the `workflow_call` event and can accept inputs, secrets, and produce outputs.

In this exercise you'll extract the deployment pattern into a reusable workflow, then call it from your CD pipeline for both staging and production.

## Scenario

The shelter's CD pipeline has two deploy jobs — staging and production — that run the exact same steps: checkout, install azd, authenticate with Azure, and deploy. The only differences are the environment name and the azd environment. Rather than maintaining duplicate job definitions, let's extract the shared pattern into a reusable workflow that both can call.

## Background

In the [previous exercise][walkthrough-previous] you created a composite action to bundle steps together. Reusable workflows solve a similar problem — avoiding duplication — but at a different level. It's important to understand when to reach for each one.

A **composite action** combines multiple *steps* into a single step that runs inside a job. A **reusable workflow** packages one or more entire *jobs* that a caller workflow references at the job level. Here's a side-by-side comparison:

| | Composite Action | Reusable Workflow |
|---|---|---|
| **What it encapsulates** | Multiple steps, run as a single step | One or more complete jobs |
| **Where it lives** | `action.yml` in any directory (e.g. `.github/actions/`) | `.github/workflows/` directory only |
| **How it's called** | `uses:` inside a job's `steps` | `uses:` directly on a `job`, not inside steps |
| **Runner control** | Runs on the caller job's runner | Each job specifies its own runner |
| **Secrets** | Cannot access secrets directly | Can receive secrets via `secrets:` or `secrets: inherit` |
| **Logging** | Appears as one collapsed step in the log | Every job and step is logged individually |
| **Nesting depth** | Up to 10 composite actions per workflow | Up to 10 levels of workflow nesting |
| **Marketplace** | Can be published to the [Actions Marketplace][actions-marketplace] | Cannot be published to the Marketplace |

**When to use which:**

- Choose a **composite action** when you want to bundle a handful of related steps that run within a single job — like the `setup-python-env` action you just built.
- Choose a **reusable workflow** when you want to share entire job definitions — including runner selection, environment targeting, and concurrency controls — across multiple workflows. Deployment pipelines are a classic use case, which is exactly what we'll build next.

## Understanding secrets in reusable workflows

Reusable workflows often need access to secrets and variables — for example, deployment credentials. There are two approaches:

### Pass all secrets

Using `secrets: inherit` to forward every secret available in the calling workflow to the reusable workflow.

    ```yaml
    deploy-staging:
      uses: ./.github/workflows/reusable-deploy.yml
      with:
        environment-name: staging
      secrets: inherit
    ```

### Define specific secrets

For a more controlled approach, you can identify which specific secrets to pass n the reusable workflow's `on.workflow_call.secrets` section:

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

Then caller then passes each secret explicitly:

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
> For deployment workflows that need Azure credentials, `secrets: inherit` is the simplest approach. However, defining specific secrets provides better documentation and prevents accidentally exposing secrets the reusable workflow doesn't need. We'll use `secrets: inherit` in this exercise for simplicity.

## Create a reusable deployment workflow

Let's extract the shared deploy steps into a reusable workflow.

1. In your codespace, create a new file at `.github/workflows/reusable-deploy.yml`.

2. Define the `workflow_call` trigger with inputs for the environment:

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
    ```

3. Add a single job that checks out the code, authenticates with Azure, and deploys:

    ```yaml
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
                --client-id "${{ vars.AZURE_CLIENT_ID }}" `
                --federated-credential-provider "github" `
                --tenant-id "${{ vars.AZURE_TENANT_ID }}"
            shell: pwsh

          - name: Deploy application
            run: azd up --environment ${{ inputs.azd-env-name }} --no-prompt
            env:
              AZURE_SUBSCRIPTION_ID: ${{ vars.AZURE_SUBSCRIPTION_ID }}
              AZURE_ENV_NAME: ${{ inputs.azd-env-name }}
              AZURE_LOCATION: ${{ vars.AZURE_LOCATION }}
    ```

> [!NOTE]
> Reusable workflows have a few important limitations: they can be nested up to 4 levels deep, and the workflow file must be located in the `.github/workflows` directory. You also cannot call a reusable workflow from within a reusable workflow's `steps` — they are called at the job level.

## Call the reusable workflow

Now update your `azure-dev.yml` to call the reusable workflow instead of duplicating the deploy steps in each job.

1. Replace the `deploy-staging` and `deploy-production` jobs with calls to the reusable workflow:

    ```yaml
    deploy-staging:
      if: github.event_name == 'workflow_dispatch' || github.event.workflow_run.conclusion == 'success'
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

2. In the terminal (<kbd>Ctl</kbd>+<kbd>`</kbd> to toggle), commit and push your changes:

    ```bash
    git add .github/workflows/reusable-deploy.yml .github/workflows/azure-dev.yml
    git commit -m "Extract reusable deploy workflow"
    git push
    ```

3. Navigate to the **Actions** tab on GitHub and verify that both deploy jobs run successfully. Notice how each appears as a separate job in the workflow visualization, even though they share the same underlying workflow definition.

> [!TIP]
> When viewing a workflow run that calls reusable workflows, GitHub shows each caller job separately. Select a job to see the steps from the reusable workflow running inside it.

This pattern keeps your deployment logic in one place. When you need to update the deployment process, you change it once in the reusable workflow and every caller benefits.

## Summary and next steps

Reusable workflows reduce duplication at the workflow level. You've extracted the shared deployment pattern into a template that both staging and production call with a single `uses` reference. This keeps your CD pipeline maintainable as it grows — any change to the deploy process only needs to happen in one place.

Next, we'll ensure quality gates are enforced with [branch protection, required workflows, and more][walkthrough-next].

## Resources

- [Reusing workflows][reusing-workflows]
- [The `workflow_call` event][workflow-call-event]
- [Sharing workflows with your organization][sharing-workflows]
- [GitHub Skills: Reusable workflows][skills-reusable-workflows]

| [← Creating Custom Actions][walkthrough-previous] | [Next: Required Workflows, Protection & Wrap-Up →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

[actions-marketplace]: https://github.com/marketplace?type=actions
[reusing-workflows]: https://docs.github.com/actions/sharing-automations/reusing-workflows
[sharing-workflows]: https://docs.github.com/actions/sharing-automations/sharing-workflows-secrets-and-runners-with-your-organization
[skills-reusable-workflows]: https://github.com/skills/reusable-workflows
[workflow-call-event]: https://docs.github.com/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#workflow_call
[walkthrough-previous]: 7-custom-actions.md
[walkthrough-next]: 9-required-workflows.md
