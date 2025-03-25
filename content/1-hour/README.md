# Getting started with GitHub Copilot

Built to be your AI pair programmer, [GitHub Copilot](https://github.com/features/copilot) helps you generate code and focus on what's important. Through the use of code completion you can create code from comments, and functions from just a signature. With Copilot chat you can ask questions about your codebase, create new files and update existing ones, and even perform operations which update files across your entire codebase.

As with any tool, there are a set of skills which need to be acquired, which is the purpose of this (roughly) one hour workshop. You'll explore the most common workloads available to you by updating an existing application.

## Prerequisites

The application for the workshop uses is built primarily with Python (Flask and SQLAlchemy) and Astro (using Tailwind and Svelte). While experience with these frameworks and languages is helpful, you'll be using Copilot to help you understand the project and generate the code. As a result, as long as you are familiar with programming you'll be able to complete the exercises!

## Required resources

To complete this workshop, you will need the following:

- A [GitHub account](https://github.com/join).
- Access to [GitHub Copilot](https://github.com/features/copilot) (which is available for free to individuals!)

## Required local installation

You will also need the following available and installed locally:

### Code editor

- [Visual Studio Code](https://code.visualstudio.com/).
- [Copilot extension installed in your IDE](https://docs.github.com/en/copilot/managing-copilot/configure-personal-settings/installing-the-github-copilot-extension-in-your-environment).

### Local services

- A recent [Node.js runtime](https://nodejs.org/en).
- A recent version of [Python](https://www.python.org/).
- The [git CLI](https://git-scm.com/).
- A shell capable of running BASH commands.

    > [!NOTE]
    > Linux and macOS are able to run BASH commands without additional configuration. For Windows, you will need either [Windows Subsystem for Linux (WS)](https://learn.microsoft.com/en-us/windows/wsl/about) or the BASH shell available via [git](https://git-scm.com/)

## Getting started

Ready to get started? Let's go! The workshop scenario imagines you as a developer volunteering your time for a pet adoption center. You've been asked to add a filter to the website to allow people to limit their search results by breed and adoption status. You'll work over the next 5 exercises to perform the tasks!

0. [Clone the repository and start the app](./0-setup.md) for the workshop
1. [Add an endpoint to the server](./1-add-endpoint.md) to list all breeds.
2. [Explore the project](./2-explore-project.md) to get a better understanding of what needs to be done.
3. [Create custom instructions](./3-copilot-instructions.md) to ensure Copilot chat has additional context.
4. [Add the new feature](./4-add-feature.md) to the website, and ensure it works!

**NEXT:** [Clone the repo and start the app](./0-setup.md)
