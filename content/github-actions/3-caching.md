# Caching

| [← Running Tests][walkthrough-previous] | [Next: Matrix Strategies & Parallel Testing →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

The [GitHub Actions Marketplace][actions-marketplace] is a collection of pre-built actions created by GitHub and the community. Actions can set up tools, run tests, deploy code, send notifications, and much more. Rather than writing everything from scratch, you can leverage the work of thousands of developers.

In this exercise you'll also learn about **caching** — a technique to speed up your workflows by reusing previously downloaded dependencies instead of fetching them from the internet on every run.

## Scenario

The CI workflow from the previous exercise works, but both jobs reinstall every dependency from scratch on every run. That means downloading Python packages, Node modules, and Playwright browsers each time — even when they haven't changed. You want to ensure workflows run as quickly as possible, to move from idea to deployed as quickly as possible.

## Background

[Caching][caching-docs] allows you install and cache dependencies like libraries. Each cache has a key. When the workflow runs, it will look for an existing cache based on the specified key name. If one doesn't exist it'll recreate it at runtime. And if it does - it'll use that cache rather than performing the reinstall!

## Add caching to the unit test job

Many popular setup actions have caching built right in. Let's start with the `test-api` job, which uses Python. Libraries are installed for Python using `pip`, which will become the key name. This instructs the workflow to cache any libraries installed using `pip`.

1. Open `.github/workflows/ci.yml`.
2. Update the **Set up Python** step in the `test-api` job to enable pip caching:

    ```yaml
          - name: Set up Python
            uses: actions/setup-python@v5
            with:
              python-version: '3.14'
              cache: 'pip'
    ```

> [!NOTE]
> The `cache: 'pip'` option tells `setup-python` to cache downloaded pip packages. On the first run it saves the cache; on subsequent runs it restores it, skipping most download time.

3. Save the file.

## Add caching to the e2e test job

The e2e job has two dependencies to cache — Python packages and the Node modules. We can follow the same path here! To make sure our packages are updated when versions change, we're going to set the `package-lock.json` file as a dependency. When the workflow runs, it will look to see if that file has changed; if it has it'll perform a reinstall. If not, it'll use the cache!

4. Update the **Set up Python** step in the `test-e2e` job the same way:

    ```yaml
          - name: Set up Python
            uses: actions/setup-python@v5
            with:
              python-version: '3.14'
              cache: 'pip'
    ```

5. Update the **Set up Node.js** step in the `test-e2e` job to enable npm caching:

    ```yaml
          - name: Set up Node.js
            uses: actions/setup-node@v4
            with:
              node-version: '20'
              cache: 'npm'
              cache-dependency-path: 'client/package-lock.json'
    ```

6. Save the file.

> [!NOTE]
> You might wonder about caching Playwright browsers too. Playwright's [official CI guidance][playwright-ci] recommends running `npx playwright install --with-deps` on every run rather than caching browsers, since browser binaries are tightly coupled to the Playwright version and caching them can lead to subtle version mismatches.

## Compare run times

Now let's push the changes and see the impact of caching.

1. Stage, commit, and push your changes:

    ```bash
    git add .github/workflows/ci.yml
    git commit -m "Add caching to CI workflow"
    git push
    ```

2. Navigate to the **Actions** tab and observe the workflow run.
3. Once it completes, check the logs for the setup steps. You should see output indicating a **cache miss** — this is expected on the first run since there's nothing cached yet.
4. To see caching in action, trigger a second run. You can push a small change (such as adding a comment to `ci.yml`) or use the GitHub UI:
   - Update the `on` section to add `workflow_dispatch:` so you can trigger runs manually
   - Push that change, then use the **Run workflow** button on the **Actions** tab

5. On the second run, check the setup step logs again. You should see a **cache hit**, and the overall run time should be noticeably shorter.

> [!TIP]
> You can view cache usage for your repository by navigating to **Actions** > **Caches** in the left sidebar. This shows all active caches, their sizes, and when they were last used.

## Summary and next steps

The Actions Marketplace provides thousands of pre-built actions so you don't have to reinvent the wheel. Many setup actions like `setup-python` and `setup-node` have caching built in, making it easy to dramatically reduce workflow run times by reusing previously downloaded dependencies.

Next, we'll explore [matrix strategies][walkthrough-next] to test across multiple configurations simultaneously.

### Resources

- [GitHub Actions Marketplace][actions-marketplace]
- [Caching dependencies to speed up workflows][caching-docs]
- [Playwright CI documentation][playwright-ci]
- [actions/setup-python][setup-python-action]
- [actions/setup-node][setup-node]

| [← Running Tests][walkthrough-previous] | [Next: Matrix Strategies & Parallel Testing →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

[actions-marketplace]: https://github.com/marketplace?type=actions
[caching-docs]: https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/caching-dependencies-to-speed-up-workflows
[marketplace]: https://github.com/marketplace
[playwright-ci]: https://playwright.dev/docs/ci
[setup-node]: https://github.com/actions/setup-node
[setup-python-action]: https://github.com/actions/setup-python
[walkthrough-previous]: 2-running-tests.md
[walkthrough-next]: 4-matrix-strategies.md
