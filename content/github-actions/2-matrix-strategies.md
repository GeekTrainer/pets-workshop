# Matrix Strategies & Parallel Testing

| [← Marketplace actions and caching][walkthrough-previous] | [Next: Deploying to Azure with azd →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

Matrix strategies let you run a job across multiple configurations in parallel — different language versions, operating systems, or test targets. This is powerful for ensuring compatibility and catching environment-specific bugs early in the development cycle.

## Scenario

The shelter wants to ensure their Python API works across Python 3.10, 3.11, and 3.12. They also want to run Playwright end-to-end tests across multiple browsers. Rather than creating separate jobs for each combination, matrix strategies handle this elegantly with minimal YAML.

## Add a matrix to the test job

Let's update the CI workflow to test the API across multiple Python versions.

1. Open **.github/workflows/ci.yml** in your codespace.
2. Locate the `test-api` job.
3. Add a `strategy` block with a `matrix` definition, and update the `python-version` input to reference the matrix value.
4. Replace the existing `test-api` job with the following:

    ```yaml
    test-api:
      runs-on: ubuntu-latest
      strategy:
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
          run: |
            python -m pytest test_app.py -v
    ```

> [!IMPORTANT]
> Make sure to quote `'3.10'` in the matrix array. Without quotes, YAML interprets `3.10` as the floating-point number `3.1`, which will cause the setup step to fail.

5. Stage, commit, and push your changes:

    ```bash
    git add .github/workflows/ci.yml
    git commit -m "Add Python version matrix to test-api job"
    git push
    ```

6. Navigate to the **Actions** tab in your repository. You should see three parallel jobs running — one for each Python version.

## Understanding matrix behavior

By default, GitHub Actions uses **fail-fast** mode: if any matrix job fails, all remaining jobs are cancelled. This is efficient but can hide failures in other configurations.

- **`fail-fast: false`** — continues running all matrix jobs even if one fails. This is valuable when you want to see the full picture of which configurations pass and which don't.
- **`max-parallel`** — limits the number of jobs running concurrently. Useful when you have resource constraints or are hitting rate limits.

Update the strategy block to disable fail-fast:

```yaml
strategy:
  fail-fast: false
  matrix:
    python-version: ['3.10', '3.11', '3.12']
```

> [!TIP]
> Setting `fail-fast: false` is particularly useful during initial setup or when debugging, as it provides a complete view of compatibility across all configurations.

## Using include and exclude

Matrix strategies support `include` and `exclude` to fine-tune which combinations run.

- **`include`** adds extra combinations or additional variables to existing combinations.
- **`exclude`** removes specific combinations from the matrix.

Here's an example that adds an extra combination with an additional environment variable, and excludes a specific one:

```yaml
strategy:
  fail-fast: false
  matrix:
    python-version: ['3.10', '3.11', '3.12']
    os: [ubuntu-latest, ubuntu-22.04]
    exclude:
      - python-version: '3.10'
        os: ubuntu-22.04
    include:
      - python-version: '3.12'
        os: ubuntu-latest
        experimental: true
```

In this example:

- The `exclude` block skips Python 3.10 on `ubuntu-22.04`.
- The `include` block adds an `experimental` flag to the Python 3.12 / `ubuntu-latest` combination, which you could reference with `${{ matrix.experimental }}` in your steps.

> [!NOTE]
> You don't need to add this to your workflow right now. This is provided as a reference for more advanced matrix configurations.

## Bonus — Browser matrix for e2e tests

The project has Playwright configured for end-to-end testing of the client application. You can apply the same matrix strategy to run tests across multiple browsers:

```yaml
test-e2e:
  runs-on: ubuntu-latest
  strategy:
    fail-fast: false
    matrix:
      browser: [chromium, firefox, webkit]

  steps:
    - uses: actions/checkout@v4

    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        cache-dependency-path: client/package-lock.json

    - name: Install dependencies
      working-directory: ./client
      run: npm ci

    - name: Install Playwright browsers
      working-directory: ./client
      run: npx playwright install --with-deps ${{ matrix.browser }}

    - name: Run Playwright tests
      working-directory: ./client
      run: npx playwright test --project=${{ matrix.browser }}
```

> [!TIP]
> Installing only the browser you need for each matrix job (using `${{ matrix.browser }}`) speeds up the workflow compared to installing all browsers in every job.

## Summary and next steps

Matrix strategies let you test across multiple configurations — Python versions, operating systems, browsers — with minimal YAML duplication. Combined with `fail-fast`, `max-parallel`, `include`, and `exclude`, you have fine-grained control over parallel testing. Next we'll [deploy to Azure using azd][walkthrough-next].

### Resources

- [Using a matrix for your jobs][matrix-docs]
- [Workflow syntax for `jobs.<job_id>.strategy`][strategy-syntax]

| [← Marketplace actions and caching][walkthrough-previous] | [Next: Deploying to Azure with azd →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

[matrix-docs]: https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs
[strategy-syntax]: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idstrategy
[walkthrough-previous]: 1-marketplace-and-caching.md
[walkthrough-next]: 3-deploy-azure.md
