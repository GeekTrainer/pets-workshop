# Providing custom instructions

There are always key pieces of information anyone generating code for your codebase needs to know - the technologies in use, coding standards to follow, project structure, etc. Since context is so important, as we've discussed, we likely want to ensure Copilot always has this information as well. Fortunately, we can provide this overview through the use of Copilot instructions.

## Scenario

Before we begin bigger updates to the site with the help of Copilot, we want to ensure it has a good understanding of how we're building our application. As a result, we're going to add a Copilot instructions file to the repository.

## Overview of Copilot instructions

Copilot instructions is a markdown file is placed in your **.github** folder. It becomes part of your project, and in turn to all contributors to your codebase. You can use this file to indicate various coding standards you wish to follow, the technologies your project uses, or anything else important for Copilot Chat to understand when generating suggestions.

> [!IMPORTANT]
> The *copilot-instructions.md* file is included in **every** call to GitHub Copilot Chat, and will be part of the context sent to Copilot. Because there is always a limited set of tokens an LLM can operate on, a large set of Copilot instructions can obscure relevant information. As such, you should limit your Copilot instructions file to project-wide information, providing an overview of what you're building and how you're building it. If you need to provide more specific information for particular tasks, you can create [prompt files](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot?tool=vscode#about-prompt-files) as needed.

Here are some guidelines to consider when creating a Copilot instructions file:

- The Copilot instructions file becomes part of the project, meaning it will apply to every developer; anything indicated in the file should be globally applicable.
- The file is markdown, so you can take advantage of that fact by grouping content together to improve readability.
- Provide overview of **what** you are building and **how** you are building it, including:
    - languages, frameworks and libraries in use.
    - required assets to be generated (such as unit tests) and where they should be placed.
    - any language specific rules such as:
        - Python code should always follow PEP8 rules.
        - use arrow functions rather than the `function` keyword.
- If you notice GitHub Copilot consistently provides an unexpected suggestion (e.g. using class components for React), add those notes to the instructions file.

Let's create a Copilot instructions file. Just as before, because we want you to explore and experiment, we won't provide exact directions on what to type, but will give enough context to create one on your own.

1. Return to your IDE with your project open.
2. Create a new file in the **.github** folder called **copilot-instructions.md**.
3. Add the markdown to the file necessary which provides information about the project structure and requirements:

    ```markdown
    # Dog shelter

    This is an application to allow people to look for dogs to adopt. It is built in a monorepo, with a Flask-based backend and Astro-based frontend.

    ## Backend

    - Built using Flask and SQLAlchemy
    - All routes require unit tests, which are created in *test_file.py* in the same folder as the file
    - When creating tests, always mock database calls

    ## Frontend

    - Built using Astro and Svelte
    - Pages should be in dark mode with a modern look and feel
    ```

4. Save the file!

## Watch the instructions file in action

Whenever you make a call to Copilot chat, the references dialog indicates all files used to generate the response. Once you create a Copilot instructions file, you will see it's always included in the references section.

1. Close all files currently open in VS Code or your Codespace.
2. Select the `+` icon in GitHub Copilot chat to start a new chat.
3. Ask Copilot chat **What are the guidelines for the flask app?**
4. Note the references now includes the instructions file and provides information gathered from it.

![Screenshot of the chat window with the references section expanded displaying Copilot instructions in the list](./images/copilot-chat-references.png)

## Summary and next steps

Given the importance of context, Copilot instructions improves the quality of suggestions, and better aligns with the desired practices you have in place. With the groundwork in place, let's [add new functionality to our website](./4-add-feature.md)!

## Resources

- [Adding repository custom instructions for GitHub Copilot](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot)

**NEXT:** [Add a new feature to your website](./4-add-feature.md)
