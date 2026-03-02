# Deploying to Azure with azd

| [← Matrix Strategies & Parallel Testing][walkthrough-previous] | [Next: Creating custom actions →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

With CI in place, it's time for CD — continuous deployment. We'll use the [Azure Developer CLI (azd)][azd-docs], Microsoft's recommended tool for deploying to Azure. azd handles the heavy lifting: generating infrastructure-as-code (Bicep), configuring passwordless authentication (OIDC), and creating the GitHub Actions workflow.

## Scenario

With the prototype built, the shelter is ready to share their application with the world. They want to deploy to Azure with:

- A **staging** environment for testing before release
- A **production** environment with manual approval before deployment
- Automatic deployment when code is pushed to main (after CI passes)

## Understanding environments and secrets

Before setting up the deployment pipeline, let's understand a few key concepts:

- **GitHub Environments** — Named deployment targets (like `staging` and `production`) that you configure in your repository settings. Each environment can have its own protection rules, secrets, and variables.
- **Secrets** — Encrypted values that are available to your workflows at runtime. Secrets are never exposed in logs and can be scoped to a repository or a specific environment.
- **Variables** — Non-sensitive configuration values available to workflows, also scopeable to environments.
- **OIDC (OpenID Connect)** — A protocol for passwordless authentication. Instead of storing long-lived credentials, your workflow requests short-lived tokens directly from Azure. This is more secure and eliminates the need to rotate secrets.

### Create your environments

1. Navigate to your repository on GitHub.
2. Select **Settings** > **Environments**.
3. Select **New environment**, name it `staging`, and select **Configure environment**. No additional rules are needed for now — select **Save protection rules**.
4. Return to **Settings** > **Environments** and select **New environment** again.
5. Name it `production` and select **Configure environment**.
6. Under **Deployment protection rules**, check **Required reviewers**.
7. Add yourself as a required reviewer and select **Save protection rules**.

> [!NOTE]
> In the next steps, `azd` will automatically configure OIDC credentials and store them as secrets in your repository. You don't need to manually create any Azure credentials.

## Install and initialize azd

Let's set up the Azure Developer CLI and scaffold the infrastructure for our project.

1. Open the terminal in your codespace (or press <kbd>Ctl</kbd>+<kbd>`</kbd> to toggle it).
2. Install azd by running:

    ```bash
    curl -fsSL https://aka.ms/install-azd.sh | bash
    ```

3. Initialize the project by running:

    ```bash
    azd init --from-code
    ```

4. Follow the prompts, accepting the defaults provided by the tool. When asked for a namespace, choose something unique (this will be used to name your Azure resources).
5. Explore the generated **infra/** directory. You'll see Bicep files (`.bicep`) that define the Azure resources for your application:

    ```bash
    ls infra/
    ```

> [!TIP]
> Bicep is Azure's domain-specific language for defining infrastructure as code. If you have GitHub Copilot, try asking it to explain the generated Bicep files!

## Configure the infrastructure

The generated Bicep files define the Azure Container Apps that will host the client and server. We need to add an environment variable so the client knows where to find the API server.

1. Open **infra/resources.bicep** in your codespace.
2. Find the section (around line 130) that reads:

    ```bicep
    {
      name: 'PORT'
      value: '4321'
    }
    ```

3. Create a new line below the closing `}` and add the following:

    ```bicep
    {
      name: 'API_SERVER_URL'
      value: 'https://${server.outputs.fqdn}'
    }
    ```

> [!NOTE]
> While the syntax resembles JSON, it's not JSON — resist the urge to add commas between the objects!

## Create the deployment workflow

Now let's authenticate with Azure and let `azd` generate the deployment workflow.

1. Authenticate with Azure:

    ```bash
    azd auth login
    ```

2. Follow the prompts to complete the authentication (a browser window will open for you to sign in).
3. Configure the deployment pipeline:

    ```bash
    azd pipeline config
    ```

    This command will:
    - Create OIDC credentials in Azure for passwordless authentication
    - Generate a workflow file at **.github/workflows/azure-dev.yml**
    - Store the necessary secrets in your repository automatically

4. When prompted to commit and push your local changes, say **yes**.
5. When prompted whether to deploy now, say **yes**.
6. Navigate to the **Actions** tab in your repository to track the deployment.

> [!IMPORTANT]
> The initial deployment will take approximately 5-10 minutes as Azure provisions the container apps, container registry, and supporting infrastructure. This is a great time for a stretch break!

## Explore the generated workflow

While the deployment runs, let's examine what `azd` generated.

1. Open **.github/workflows/azure-dev.yml** in your codespace.
2. Note the key sections of the workflow:

    - **`on` triggers** — The workflow runs on `workflow_dispatch` (manual trigger) and `push` to the `main` branch:

        ```yaml
        on:
          workflow_dispatch:
          push:
            branches:
              - main
        ```

    - **`permissions` block** — Includes `id-token: write`, which is required for OIDC authentication:

        ```yaml
        permissions:
          id-token: write
          contents: read
        ```

    - **Azure login step** — Uses the `azure/login` action with OIDC (no stored passwords):

        ```yaml
        - name: Log in with Azure (Federated Credentials)
          run: |
            azd auth login `
              --client-id "$Env:AZURE_CLIENT_ID" `
              --federated-credential-provider "github" `
              --tenant-id "$Env:AZURE_TENANT_ID"
        ```

    - **Provision and deploy steps** — `azd` handles both infrastructure provisioning and application deployment.

3. Notice how `azd` configured everything automatically — OIDC credentials, environment variables, and the workflow file.

> [!TIP]
> If you have GitHub Copilot, try selecting the entire workflow file and asking it to explain what each section does!

## Extend the workflow with CI gates

The generated workflow deploys directly on push. Let's enhance it with CI gates and staged environments, so tests must pass before deployment and production requires manual approval.

1. Open **.github/workflows/azure-dev.yml**.
2. Restructure the `jobs` section to create a pipeline with CI gates and staged deployments. Replace the existing jobs with the following structure:

    ```yaml
    jobs:
      test-api:
        runs-on: ubuntu-latest
        strategy:
          fail-fast: false
          matrix:
            python-version: ['3.10', '3.11', '3.12']
        steps:
          - uses: actions/checkout@v4

          - name: Set up Python ${{ matrix.python-version }}
            uses: actions/setup-python@v5
            with:
              python-version: ${{ matrix.python-version }}
              cache: 'pip'

          - name: Install dependencies
            run: |
              python -m pip install --upgrade pip
              pip install -r server/requirements.txt
              pip install pytest

          - name: Run tests
            working-directory: ./server
            run: python -m pytest test_app.py -v

      deploy-staging:
        runs-on: ubuntu-latest
        needs: [test-api]
        environment: staging
        concurrency:
          group: deploy-${{ github.ref }}-staging
          cancel-in-progress: true
        permissions:
          id-token: write
          contents: read
        steps:
          - uses: actions/checkout@v4

          - name: Install azd
            uses: Azure/setup-azd@v2

          - name: Log in with Azure (Federated Credentials)
            run: |
              azd auth login \
                --client-id "${{ vars.AZURE_CLIENT_ID }}" \
                --federated-credential-provider "github" \
                --tenant-id "${{ vars.AZURE_TENANT_ID }}"

          - name: Provision and deploy to staging
            run: azd up --environment staging --no-prompt
            env:
              AZURE_SUBSCRIPTION_ID: ${{ vars.AZURE_SUBSCRIPTION_ID }}
              AZURE_ENV_NAME: ${{ vars.AZURE_ENV_NAME }}
              AZURE_LOCATION: ${{ vars.AZURE_LOCATION }}

      deploy-production:
        runs-on: ubuntu-latest
        needs: [deploy-staging]
        environment: production
        concurrency:
          group: deploy-${{ github.ref }}-production
          cancel-in-progress: false
        permissions:
          id-token: write
          contents: read
        steps:
          - uses: actions/checkout@v4

          - name: Install azd
            uses: Azure/setup-azd@v2

          - name: Log in with Azure (Federated Credentials)
            run: |
              azd auth login \
                --client-id "${{ vars.AZURE_CLIENT_ID }}" \
                --federated-credential-provider "github" \
                --tenant-id "${{ vars.AZURE_TENANT_ID }}"

          - name: Provision and deploy to production
            run: azd up --environment production --no-prompt
            env:
              AZURE_SUBSCRIPTION_ID: ${{ vars.AZURE_SUBSCRIPTION_ID }}
              AZURE_ENV_NAME: ${{ vars.AZURE_ENV_NAME }}
              AZURE_LOCATION: ${{ vars.AZURE_LOCATION }}
    ```

Key things to note about this structure:

- **`needs: [test-api]`** on the staging job ensures all CI tests pass before any deployment begins.
- **`needs: [deploy-staging]`** on the production job creates a sequential pipeline: tests → staging → production.
- **`environment: staging`** and **`environment: production`** link each job to the GitHub Environments you created earlier. The production environment will trigger the approval gate.
- **`concurrency`** groups prevent conflicting deployments to the same environment. Note `cancel-in-progress: false` on production to avoid accidentally cancelling an active deployment.

3. Stage, commit, and push your changes:

    ```bash
    git add .github/workflows/azure-dev.yml
    git commit -m "Add CI gates and staged deployments to azure-dev workflow"
    git push
    ```

## Test the pipeline

With everything in place, let's watch the full pipeline in action.

1. Navigate to the **Actions** tab in your repository.
2. Select the latest workflow run triggered by your push.
3. Observe the pipeline stages:
    - **test-api** jobs run first (three parallel jobs for Python 3.10, 3.11, 3.12)
    - Once all tests pass, **deploy-staging** proceeds automatically
    - After staging completes, **deploy-production** shows a **Waiting for review** badge
4. Select **Review deployments** on the production job.
5. Check the **production** environment and select **Approve and deploy**.
6. Once the production deployment completes, expand the deploy step logs to find the application URLs.
7. Open the client URL in your browser — you should see the pet shelter application live!

> [!TIP]
> You can also find your deployment URLs by running `azd show` in the terminal.

## Summary and next steps

Congratulations! You've deployed the pet shelter application to Azure using `azd` and extended the generated workflow with:

- **CI gates** — tests must pass before deployment begins
- **Staged environments** — staging deploys automatically, production requires approval
- **OIDC authentication** — passwordless, short-lived tokens instead of stored credentials
- **Concurrency controls** — preventing conflicting deployments

Next we'll [create custom actions][walkthrough-next] to reduce duplication and make our workflows more maintainable.

### Resources

- [What is the Azure Developer CLI?][azd-docs]
- [About security hardening with OpenID Connect][oidc-docs]
- [Deploying with GitHub Actions][actions-deploy]
- [Using environments for deployment][environments-docs]

| [← Matrix Strategies & Parallel Testing][walkthrough-previous] | [Next: Creating custom actions →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

[actions-deploy]: https://docs.github.com/en/actions/use-cases-and-examples/deploying/deploying-with-github-actions
[azd-docs]: https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/overview
[environments-docs]: https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-deployments/using-environments-for-deployment
[oidc-docs]: https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect
[walkthrough-previous]: 2-matrix-strategies.md
[walkthrough-next]: 4-custom-actions.md
