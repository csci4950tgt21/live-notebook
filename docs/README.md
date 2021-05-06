# Getting Started

## [User Wiki](https://github.com/csci4950tgt21/live-notebook/wiki)

## Maintenance & Extensibility

### [VS Code Extension Anatomy](https://code.visualstudio.com/api/get-started/extension-anatomy)

#### [extension.ts](../src/extension.ts)

This is the entry point of the extension, which has a `activate` and `deactivate`.

Let us break down `activate` first, which is called once when the extension is activated, triggered by any event specified in [`package.json`](#packagejson).

We first create the objects that are shared between class instances, whose references will be passed down to constructors as needed in aspect-oriented pattern later in the function. This currently includes global objects that manage _config_, _token matching_, and _API calls_.

```js
function activate(context: vscode.ExtensionContext) {
	let globalConfigManager: ConfigManager = new ConfigManager(vscode.workspace.getConfiguration(configName), configName);
	let globalMatcher: TokenMatcher = new TokenMatcher(globalConfigManager);
	let apiCalls: APICalls = new APICalls(globalConfigManager);
    // ...
```

For most of this function, we register providers and event actions that work with the [VSCode API](https://code.visualstudio.com/api/references/vscode-api). For example, [`HoverProvider`](Hover.md) and [`ExtendedResultsProvider`](Sidebar.md) are registered as follows,

```js
    context.subscriptions.push(
    vscode.languages.registerHoverProvider(
        "plaintext",
        new NotebookHoverProvider(globalMatcher, apiCalls)
    )
    );

    context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
        "plaintext",
        new ExtendedResultsProvider(globalMatcher)
    )
    );
```

The next part we instantiate objects that manage the side panels, which is linked to the `ExtendedResultsProvider` who provides the [`CodeAction`](https://code.visualstudio.com/api/references/vscode-api#CodeAction) who triggers the command `"liveNotebook.openSideBar"` which in turn triggers `commandHandle`. This could possibly be put in the constructor of `ExtendedResultsProvider` to make `activate` more single-purposed.

```js
    const command = "liveNotebook.openSideBar";
    let tempSideBar = new SidePanels(apiCalls);

    const commandHandle = (stringOfInterest: string) => {
    tempSideBar.onHoverFocus(stringOfInterest);
    };

    context.subscriptions.push(
    vscode.commands.registerCommand(command, commandHandle)
    );
```

`DiagnosticsProvider` subsribes to document changes and reacts accordingly by refeshing the [Diagnostics (underline)](Underline.md).

```js
    new DiagnositcsProvider(context, globalMatcher);
```

_Note that in this event-drive architecture, parts of this function can be reordered with little to no issue._

At the time of writing, `deactivate` is needed for any cleanup.

#### [package.json](../src/package.json)

##### [activationEvents](https://code.visualstudio.com/api/references/activation-events)

##### [contributes.configuration](https://code.visualstudio.com/api/references/contribution-points#contributes.configuration)

### [Possible Future Features](https://github.com/csci4950tgt21/live-notebook/wiki/Options-For-Future-Development)
