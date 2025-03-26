# Helping GitHub Copilot understand context

| [← Coding with GitHub Copilot][walkthrough-previous] | [Next: Providing custom instructions →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

The key to success when coding (and much of life) is context. Before we add code to a codebase, we want to understand the rules and structures already in place. When working with an AI coding assistant such as GitHub Copilot the same concept applies - the quality of suggestion is directly proportional to the context Copilot has. Let's use this opportunity to both explore the project we've been given and how to interact with Copilot to ensure it has the context it needs to do its best work.

## Scenario

Before adding new functionality to the website, you want to explore the existing structure to determine where the updates need to be made.

## Chat participants and extensions

GitHub Copilot Chat has a set of available [chat participants][chat-participants] and [extensions][copilot-extensions] available to you to both provide instructions to GitHub Copilot and access external services. Chat participants are helpers which work inside your IDE and have access to your project, while extensions can call external services and provide information to you without having to open separate tools. We're going to focus on one core chat participant - `@workspace`.

`@workspace` creates an index of your project and allows you to ask questions about what you're currently working on, to find resources inside the project, or add it to the context. It's best to use this when the entirety of your project should be considered or you're not entirely sure where you should start looking. In our current scenario, since we want to ask questions about our project, `@workspace` is the perfect tool for the job.

> [!NOTE]
> This exercise doesn't provide specific prompts to type, as part of the learning experience is to discover how to interact with Copilot. Feel free to talk in natural language, describing what you're looking for or need to accomplish.

1. Return to your IDE with the project open.
2. Close any tabs you may have open in your IDE to ensure the context for Copilot chat is empty.
3. Open GitHub Copilot Chat.
4. Select the `+` icon towards the top of Copilot chat to begin a new chat.
5. Type `@workspace` in the chat prompt window and hit <kbd>tab</kbd> to select or activate it, then continue by asking Copilot about your project. You can ask what technologies are in use, what the project does, where functionality resides, etc.
6. Spend a few minutes exploring to find the answers to the following questions:
    - Where's the database the project uses?
    - What files are involved in listing dogs?

## Summary and next steps

You've explored context in GitHub Copilot, which is key to generating quality suggestions. You saw how you can use chat participants to help guide GitHub Copilot, and how with natural language you can explore the project. Let's see how we can provide even more context to Copilot chat through the use of [Copilot instructions][walkthrough-next].

## Resources

- [Copilot Chat cookbook][copilot-cookbook]
- [Use Copilot Chat in VS Code][copilot-chat-vscode]
- [Copilot extensions marketplace][copilot-marketplace]

| [← Coding with GitHub Copilot][walkthrough-previous] | [Next: Providing custom instructions →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

[chat-participants]: https://code.visualstudio.com/docs/copilot/copilot-chat#_chat-participants
[copilot-chat-vscode]: https://code.visualstudio.com/docs/copilot/copilot-chat
[copilot-cookbook]: https://docs.github.com/en/copilot/copilot-chat-cookbook
[copilot-extensions]: https://docs.github.com/en/copilot/using-github-copilot/using-extensions-to-integrate-external-tools-with-copilot-chat
[copilot-marketplace]: https://github.com/marketplace?type=apps&copilot_app=true
[walkthrough-previous]: ./1-add-endpoint.md
[walkthrough-next]: ./3-copilot-instructions.md