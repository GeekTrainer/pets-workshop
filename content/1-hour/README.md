# Modern DevOps with GitHub

[DevOps](https://en.wikipedia.org/wiki/DevOps) is a [portmanteau](https://www.merriam-webster.com/dictionary/portmanteau) of **development** and **operations**. At its core is a desire to bring development practices more inline with operations, and operations practices more inline with development. This fosters better communication and collaboration between teams, breaks down barriers, and gives everyone an investment in ensuring customers are delighted by the software we ship.

This workshop is built to help guide you through some of the most common DevOps tasks on GitHub. You'll explore:

- Managing projects with [GitHub Issues](https://github.com/features/issues)
- Creating a development environment with [GitHub Codespaces](https://github.com/features/codespaces)
- Using [GitHub Copilot](https://github.com/features/copilot) as your AI pair programmer
- Securing the development pipeline with [GitHub Advanced Security](https://github.com/features/security)
- Automating tasks and CI/CD with [GitHub Actions](https://github.com/features/actions)

## Prerequisites

The application for the workshop uses is built primarily with Python (Flask and SQLAlchemy) and Astro (using Tailwind and Svelte). While experience with these frameworks and languages is helpful, you'll be using Copilot to help you understand the project and generate the code. As a result, as long as you are familiar with programming you'll be able to complete the exercises!

## Required resources

To complete this workshop, you will need the following:

- A [GitHub account](https://github.com/join).
- Access to [GitHub Copilot](https://github.com/features/copilot).

You will also need the following available and installed locally:

- An integrated development environment, such as Visual Studio Code or JetBrains.
- A recent [Node.js runtime](https://nodejs.org/en).
- A recent version of [Python](https://www.python.org/).
- The [git CLI](https://git-scm.com/).
- A shell capable of running BASH commands.

    > [!NOTE]
    > Linux and macOS are able to run BASH commands without additional configuration. For Windows, you will need either [Windows Subsystem for Linux (WS)](https://learn.microsoft.com/en-us/windows/wsl/about) or the BASH shell available via [git](https://git-scm.com/)

## Getting started

Ready to get started? Let's go! The workshop scenario imagines you as a developer volunteering your time for a pet adoption center. You will work through the process of creating a development environment, creating code, enabling security, and automating processes.

0. [Setup your environment](./0-setup.md) for the workshop
1. [Provide Copilot context](./1-context.md) to generate quality code suggestions
2. [Add features to your app](./2-code.md) with GitHub Copilot
