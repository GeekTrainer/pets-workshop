# Add the filter feature

We've explored how we can use GitHub Copilot to explore our project and to provide context to ensure the suggestions we receive are to the quality we expect. Now let's turn our attention to putting all this prep work into action by generating new code! We'll use GitHub Copilot to aid us in adding functionality to our website.

## Scenario

The website currently lists all dogs in the database. While this was appropriate when the shelter only had a few dogs, as time has gone on the number has grown and it's difficult for people to sift through who's available to adopt. The shelter has asked you to add filters to the website to allow a user to select a breed of dog and only display dogs which are available for adoption.

## Copilot Edits

Previously we utilized Copilot chat to work with an individual file. However, most updates necessitate changes to multiple files throughout a codebase. Even a seemingly basic change to a webpage likely requires updating HTML, CSS and JavaScript files. Copilot Edits allows you to modify multiple files at once.

With Copilot Edits, you will add the files which need to be updated to the context. Once you provide the prompt, Copilot Edits will begin the updates across all files in the context. It also has the ability to create new files or add files to the context as it deems appropriate.

## Add the filters to the page

Adding the filters to the page will require updating a minimum of two files - the Flask backend and the Svelte frontend. Fortunately, Copilot Edits can update multiple files! Let's get our page updated with the help of Copilot Edits.

> [!NOTE]
> Because Copilot Edits works best with auto-save enabled, we'll activate it. As we'll explore a little later in this exercise, Copilot Edits provides powerful tools to undo any changes you might not wish to keep.

1. Enable Auto Save by selecting **File** > **Auto Save**.
2. Open the following files in your IDE (which we'll point Copilot chat to for context):
   - **server/app.py**
   - **client/src/components/DogList.svelte** 
3. Select **Copilot Edits** in the Copilot Chat window.
4. If available, select **Claude 3.5 Sonnet** from the list of available models.
5. Select **Add Context...** in the chat window.
6. Select **Open Editors** from the prompt. This will add all currently open files to the context.
7. Ask Copilot to perform the operation you want, to update the page to add the filters. It should meet the following requirements:
    - A dropdown list should be provided with all breeds
    - A checkbox should be available to only show available dogs
    - The page should automatically refresh whenever a change is made

Copilot begins generating the suggestions!

## Reviewing the suggestions

Unlike our prior examples where we worked with an individual file, we're now working with changes across multiple files - and maybe multiple sections of multiple files. Fortunately, Copilot Edits has functionality to help streamline this process.

As the code is generated, you will notice the files are displayed using an experience similar to diff files, with the new code highlighted in green and old code highlighted in red (by default). You'll also notice interfaces which allow you to select a checkbox to accept individual changes, and **Keep** buttons to accept changes for an individual file or across all updates.

1. Review the code suggestions to ensure they behave the way you expect them to, making any necessary changes. Once you're satisfied, you can select **Keep** on the files individually or in Copilot Chat to accept all changes.
2. Open the page at [http://localhost:4321](http://localhost:4321) to see the updates!
3. Run the Python tests by using `python -m unittest` in the terminal as you did previously.
4. If any changes are needed, explain the required updates to GitHub Copilot and allow it to generate the new code.

> [!IMPORTANT]
> Working iteratively a normal aspect of coding with an AI pair programmer. You can always provide more context to ensure Copilot understands, make additional requests, or rephrase your original prompts. To aid you in working iteratively, you will notice undo and redo buttons towards the top of the Copilot Edits interface, which allow you to move back and forth across prompts.

5. Optional: Disable Auto Save by unselecting **File** > **Auto Save**.

## Summary

Congratulations! You've worked with GitHub Copilot to add new features to the website - the ability to filter the list of dogs.

##

## Resources

- [Asking GitHub Copilot questions in your IDE](https://docs.github.com/en/copilot/using-github-copilot/copilot-chat/asking-github-copilot-questions-in-your-ide)
- [Copilot Edits](https://code.visualstudio.com/docs/copilot/copilot-edits)
- [Copilot Chat cookbook](https://docs.github.com/en/copilot/copilot-chat-cookbook)

**NEXT:** If you've made it here and want to keep exploring, we've got some [bonus suggestions](./5-bonus.md) for you!
