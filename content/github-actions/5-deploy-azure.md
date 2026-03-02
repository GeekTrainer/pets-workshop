# Deploying to Azure with azd

| [← Matrix Strategies & Parallel Testing][walkthrough-previous] | [Next: Creating custom actions →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

With CI in place, it's time for CD — continuous deployment or continuous delivery. We'll use the [Azure Developer CLI (azd)][azd-docs], Microsoft's recommended tool for deploying to Azure. **azd** handles the heavy lifting: generating infrastructure-as-code (Bicep), configuring passwordless authentication (OIDC), and creating the GitHub Actions workflow.

## Scenario

With the prototype built, the shelter is ready to share their application with the world! They want to ensure last minute testing is done on the application before it's deployed to production.

## Background

### Secrets and variables

Speaking of secrets and variables... In a prior exercise you utilized `GITHUB_TOKEN`. `GITHUB_TOKEN` is a special secret automatically available to every workflow, and provides access to the current repository. You can add your own secrets and variables to your repository for use in workflows.

Secrets are exactly that - secret. These are passwords and other values you don't want the public to be able to see. You can add secrets via the CLI, APIs, and your repository's page on github.com. Secrets are write-only, and are only available to be read by a running workflow. In fact, there's even a filter so if the workflow attempts to write or log a secret it'll automatically be hidden. You can confidently add secrets to a public repository, and the only visible aspect will be its name and not the value.

Variables, on the other hand, are designed to be public values. They're settings like URLs or names, or other values that aren't sensitive. Variables can be both read and written. Use variables whenever you need the ability to configure a value outside a workflow.

### Environments

There's many approaches to deployment of an application. A classic is a **staging** > **production** setup, where **staging** is as close to mimicking the real world as possible, and **production** is, well, the actual application. By using this strategy it allows for any last checks to be performed before opening the doors to the public.

Typically each environment will have its own configuration - its own server, URLs, databases, etc. Deploying to each will typically require different configurations. Actions supports this through the use of environments. With an environment you can create a set of secrets or variables for each environment, ensuring the right ones are used at the right time.

Environments can have deployment rules, which allow you to control when a workflow is allowed to use a particular environment. Sticking with the staging/production approach, you'll typically have a broader set of team members who have permissions to deploy to staging, but limit those who can deploy to production. In our scenario, we're going to allow anyone to deploy to staging, but you'll be the only one who's allowed to deploy to production.

## Create your environments

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
> While the syntax resembles JSON, **it's not JSON**. You'll need to resist the natural urge to add commas between the objects!

## Create the CD workflow

By default, `azd pipeline config` generates a simple workflow that deploys on every push to `main`. That works for getting started, but we want staged deployments with approval gates. The good news: if you create the workflow file *first*, `azd` will detect it and configure credentials around your custom workflow instead of generating the default.

Let's create a workflow that:
- Only deploys **after CI passes** — using [`workflow_run`][workflow-run-docs]
- Deploys to **staging** first, automatically
- Requires **manual approval** before deploying to **production**
- Prevents **conflicting deployments** with concurrency controls

1. Create a new file at `.github/workflows/azure-dev.yml`.
2. Add the following content:

    ```yaml
    name: CD

    on:
      workflow_dispatch:
      workflow_run:
        workflows: ["CI"]
        branches: [main]
        types: [completed]

    permissions:
      id-token: write
      contents: read

    jobs:
      deploy-staging:
        runs-on: ubuntu-latest
        if: github.event_name == 'workflow_dispatch' || github.event.workflow_run.conclusion == 'success'
        environment: staging
        concurrency:
          group: deploy-${{ github.ref }}-staging
          cancel-in-progress: true

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
        needs: deploy-staging
        environment: production
        concurrency:
          group: deploy-${{ github.ref }}-production
          cancel-in-progress: false

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

3. Save the file.

Let's walk through the key parts:

- **`permissions: id-token: write`** — In the [Running Tests][running-tests] module you set `contents: read`. Here, `id-token: write` is added because the workflow needs to request OIDC tokens from Azure. This is how passwordless authentication works — no stored credentials, just short-lived tokens.
- **`vars.*`** — Variables like `${{ vars.AZURE_CLIENT_ID }}` reference **repository variables** that `azd pipeline config` will create for you in the next step.
- **`workflow_run`** triggers this workflow whenever the **CI** workflow completes on `main`. The `if` condition ensures it only proceeds when CI **succeeded** — or when triggered manually via `workflow_dispatch`.
- **`environment: staging`** and **`environment: production`** link each job to the GitHub Environments you created earlier. The production environment will trigger the approval gate you configured.
- **`needs: deploy-staging`** on the production job creates the sequential flow: staging must succeed before production is offered for review.
- **`concurrency`** groups prevent conflicting deployments to the same environment. Note `cancel-in-progress: false` on production to avoid accidentally cancelling an active deployment.
- **`azd up`** provisions infrastructure and deploys your application in one command, targeted at a specific environment.

## Set up Azure authentication

Now let's authenticate with Azure and let `azd` configure the pipeline credentials. Because the workflow file already exists, `azd` will configure OIDC and variables around it rather than generating a new one.

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
    - Store the necessary secrets and variables in your repository automatically
    - Detect your existing workflow file and configure it

4. When prompted to commit and push your local changes, say **yes**.

> [!TIP]
> After `azd pipeline config` completes, navigate to **Settings** > **Secrets and variables** > **Actions** > **Variables** tab to see the repository variables it created (like `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, etc.). These are the `vars.*` values your workflow references.

## Test the pipeline

When you said **yes** to `azd pipeline config`'s commit prompt, it pushed your changes — including the workflow file. Let's verify everything is working.

1. Navigate to the **Actions** tab. The push will trigger the **CI** workflow first.
2. Once CI completes successfully, the **CD** workflow will start automatically.
3. Observe the pipeline stages:
    - **deploy-staging** proceeds automatically
    - After staging completes, **deploy-production** shows a **Waiting for review** badge
4. Select **Review deployments** on the production job.
5. Check the **production** environment and select **Approve and deploy**.
6. Once the production deployment completes, expand the deploy step logs to find the application URLs.
7. Open the client URL in your browser — you should see the pet shelter application live!

> [!TIP]
> You can also find your deployment URLs by running `azd show` in the terminal.

## Summary and next steps

Congratulations! You've deployed the pet shelter application to Azure with a proper CI/CD pipeline:

- **CI-gated deployment** — CD only runs after CI passes, using `workflow_run`
- **Staged environments** — staging deploys automatically, production requires approval
- **OIDC authentication** — passwordless, short-lived tokens instead of stored credentials
- **Concurrency controls** — preventing conflicting deployments
- **azd integration** — `azd pipeline config` configured credentials around your custom workflow

Next we'll [create custom actions][walkthrough-next] to reduce duplication and make our workflows more maintainable.

### Resources

- [What is the Azure Developer CLI?][azd-docs]
- [Create a custom pipeline definition][azd-pipeline-definition]
- [Events that trigger workflows: workflow_run][workflow-run-docs]
- [About security hardening with OpenID Connect][oidc-docs]
- [Deploying with GitHub Actions][actions-deploy]
- [Using environments for deployment][environments-docs]

| [← Matrix Strategies & Parallel Testing][walkthrough-previous] | [Next: Creating custom actions →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

[actions-deploy]: https://docs.github.com/en/actions/use-cases-and-examples/deploying/deploying-with-github-actions
[azd-docs]: https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/overview
[azd-pipeline-definition]: https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/pipeline-create-definition
[environments-docs]: https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-deployments/using-environments-for-deployment
[oidc-docs]: https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect
[running-tests]: 2-running-tests.md
[workflow-run-docs]: https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#workflow_run
[walkthrough-previous]: 4-matrix-strategies.md
[walkthrough-next]: 6-custom-actions.md
