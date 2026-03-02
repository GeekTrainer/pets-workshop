# The Marketplace & Caching

| [← Introduction & Your First CI Workflow][walkthrough-previous] | [Next: Matrix Strategies & Parallel Testing →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

**Estimated time: 25 minutes**

The [GitHub Actions Marketplace][actions-marketplace] is a collection of pre-built actions created by GitHub and the community. Actions can set up tools, run tests, deploy code, send notifications, and much more. Rather than writing everything from scratch, you can leverage the work of thousands of developers.

In this exercise you'll also learn about **caching** — a technique to speed up your workflows by reusing previously downloaded dependencies instead of fetching them from the internet on every run.

## Scenario

The CI workflow works, but it reinstalls every dependency from scratch on every run. That means downloading Python packages and Node modules each time — even when they haven't changed. The marketplace has actions that can streamline setup and add caching to speed things up significantly.

## Exploring the marketplace

Let's take a look at what's available.

1. Navigate to [github.com/marketplace][marketplace] and filter to **Actions** using the left sidebar.
2. Search for **setup-python** and select the official **actions/setup-python** result.
3. Take note of a few things on the action page:
   - The **Verified creator** badge — this indicates the action is published by a trusted organization.
   - The version tags (e.g., `@v5`) — you'll use these to pin a specific version.
   - The **Inputs** and **Outputs** sections — these describe what the action accepts and provides.

> [!IMPORTANT]
> When evaluating third-party actions, always check for the **Verified creator** badge, review the repository's maintenance activity (recent commits, open issues), and pin actions to a specific version or commit SHA. Using unverified or unpinned actions can introduce security risks into your pipeline.

4. Search for **setup-node** and review the [actions/setup-node][setup-node] action page. Notice both `setup-python` and `setup-node` support built-in caching.

## Add caching to the workflow

Let's update our CI workflow to take advantage of built-in caching.

1. Open `.github/workflows/ci.yml`.
2. Update the **Set up Python** step in the `test-api` job to enable pip caching:

    ```yaml
          - name: Set up Python
            uses: actions/setup-python@v5
            with:
              python-version: '3.12'
              cache: 'pip'
    ```

    > [!NOTE]
    > The `cache: 'pip'` option tells `setup-python` to cache downloaded pip packages. On the first run it saves the cache; on subsequent runs it restores it, skipping most download time.

3. Update the **Set up Node.js** step in the `build-client` job to enable npm caching:

    ```yaml
          - name: Set up Node.js
            uses: actions/setup-node@v4
            with:
              node-version: '20'
              cache: 'npm'
              cache-dependency-path: 'client/package-lock.json'
    ```

    > [!TIP]
    > The `cache-dependency-path` input tells the action where to find the lock file. This is important when your `package-lock.json` isn't at the repository root.

4. Save the file.

## Upload build artifacts

Artifacts let you persist files produced during a workflow run — such as build outputs, test reports, or logs. Let's upload the client build so it's available for download or use by later jobs.

1. In the `build-client` job, add a new step after the **Build client** step:

    ```yaml
          - name: Upload build artifact
            uses: actions/upload-artifact@v4
            with:
              name: client-dist
              path: client/dist/
    ```

2. Save the file.

> [!NOTE]
> Artifacts are stored for 90 days by default. You can download them from the workflow run page by selecting the artifact name under the **Artifacts** section. This is useful for sharing build outputs, deploying from a later job, or debugging failed builds.

## Compare run times

Now let's push the changes and see the impact of caching.

1. Stage, commit, and push your changes:

    ```bash
    git add .github/workflows/ci.yml
    git commit -m "Add caching and artifact upload to CI workflow"
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

The Actions Marketplace provides thousands of pre-built actions so you don't have to reinvent the wheel. Caching can dramatically reduce workflow run times by reusing previously downloaded dependencies. Artifacts let you persist and share build outputs across jobs and with your team.

Next, we'll explore [matrix strategies][walkthrough-next] to test across multiple configurations simultaneously.

### Resources

- [GitHub Actions Marketplace][actions-marketplace]
- [Caching dependencies to speed up workflows][caching-docs]
- [Storing and sharing data from a workflow][artifacts-docs]
- [actions/setup-python][setup-python-action]
- [actions/setup-node][setup-node]

| [← Introduction & Your First CI Workflow][walkthrough-previous] | [Next: Matrix Strategies & Parallel Testing →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

[actions-marketplace]: https://github.com/marketplace?type=actions
[artifacts-docs]: https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/storing-and-sharing-data-from-a-workflow
[caching-docs]: https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/caching-dependencies-to-speed-up-workflows
[marketplace]: https://github.com/marketplace
[setup-node]: https://github.com/actions/setup-node
[setup-python-action]: https://github.com/actions/setup-python
[walkthrough-previous]: 0-introduction.md
[walkthrough-next]: 2-matrix-strategies.md
