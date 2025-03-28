# Coding with GitHub Copilot

With code completion, GitHub Copilot provides suggestions in your code editor while you're coding. This can turn comments into code, generate the next line of code, and generate an entire function just from a signature. Code completion helps reduce the amount of boilerplate code and ceremony you need to type, allowing you to focus on the important aspects of what you're creating.

## Scenario

It's standard to work in phases when adding functionality to an application. Given that we know we want to allow users to filter the list of dogs based on breed, we'll need to add an endpoint to provide a list of all breeds. Later we'll add the rest of the functionality, but let's focus on this part for now.

The application uses a Flask app with SQLAlchemy as the backend API (in the [/server](/server/) folder), and an Astro app with Svelte as the frontend (in the [/client](/client/) folder). You will explore more of the project later; this exercise will focus solely on the Flask application.

> [!NOTE]
> As you begin making changes to the application, there is always a chance a breaking change could be created. If the page stops working, check the terminal window you used previously to start the application for any error messages. You can stop the app by using <kbd>Ctl</kbd>+<kbd>C</kbd>, and restart it by running `./scripts/start-app.sh`.

## Flask routes

While we won't be able to provide a full overview of [routing in Flask](https://flask.palletsprojects.com/en/stable/quickstart/#routing), they are defined by using the Python decorator `@app.route`. There are a couple of parameters you can provide to `@app.route`, including the path (or URL) one would use to access the route (such as **api/breeds**), and the [HTTP method(s)](https://www.w3schools.com/tags/ref_httpmethods.asp) which can be used.

## Code completion

Code completion predicts the next block of code you're about to type based on the context Copilot has. For code completion, this includes the file you're currently working on and any tabs open in your IDE.

Code completion is best for situations where you know what you want to do, and are more than happy to just start writing code with a bit of a helping hand along the way. Suggestions will be generated based both on the code you write (say a function definition) and comments you add to your code.

## Create the breeds endpoint

Let's build our new route in our Flask backend with the help of code completion.

> [!IMPORTANT]
> For this exercise, **DO NOT** copy and paste the code snippet provided, but rather type it manually. This will allow you to experience code completion as you would if you were coding back at your desk. You'll likely see you only have to type a few characters before GitHub Copilot begins suggesting the rest.

1. Return to your IDE with the project open.
2. Open **server/app.py**.
3. Locate the comment which reads `## HERE`, which should be at line 68.
4. Delete the comment to ensure there isn't any confusion for Copilot, and leave your cursor there.
5. Begin adding the code to create the route to return all breeds from an endpoint of **api/breeds** by typing the following:

    ```python
    @app.route('/api/breeds', methods=['GET'])
    ```

6. Once you see the full function signature, select <kbd>Tab</kbd> to accept the code suggestion.
7. If it didn't already, code completion should then suggest the remainder of the function signature; just as before select <kbd>Tab</kbd> to accept the code suggestion.
    
    The code generated should look a little like this:

    ```python
    @app.route('/api/breeds', methods=['GET'])
    def get_breeds():
        # Query all breeds
        breeds_query = db.session.query(Breed.id, Breed.name).all()
        
        # Convert the result to a list of dictionaries
        breeds_list = [
            {
                'id': breed.id,
                'name': breed.name
            }
            for breed in breeds_query
        ]
        
        return jsonify(breeds_list)
    ```

    > [!IMPORTANT]
    > Because LLMs are probabilistic, not deterministic, the exact code generated can vary. The above is a representative example. If your code is different, that's just fine as long as it works!

8. **Save** the file.

## Validate the endpoint

With the code created and saved, let's quickly validate the endpoint to ensure it works.

1. Navigate to [http://localhost:5100/api/breeds](http://localhost:5100/api/breeds) to validate the route. You should see JSON displayed which contains the list of breeds!

## Summary and next steps

You've added a new endpoint with the help of GitHub Copilot! You saw how Copilot predicted the next block of code you were likely looking for and provided the suggestion inline, helping save you the effort of typing it out manually. Let's start down the path of performing more complex operations by [exploring our project](./2-explore-project.md).

## Resources

- [Code suggestions in your IDE with GitHub Copilot](https://docs.github.com/en/copilot/using-github-copilot/getting-code-suggestions-in-your-ide-with-github-copilot)
- [Code completions with GitHub Copilot in VS Code](https://code.visualstudio.com/docs/copilot/ai-powered-suggestions)
- [Prompt crafting](https://code.visualstudio.com/docs/copilot/prompt-crafting)

**NEXT:** [Exercise 2: Explore your project with Copilot](./2-explore-project.md)
