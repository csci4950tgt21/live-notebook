#### The Sidebar Feature (AKA SidePanel)

The sidebar is registered in [extension.ts](../extension.ts), using [vscode.languages.registerCodeActionsProvider](https://code.visualstudio.com/api/references/vscode-api). The command, ```liveNotebook.openSideBar``` is also
registered there, this command creates a new sidepanel, or focuses on an existing sidepanel when executed.

The sidebar, when registered as mentioned above, is registered with an instance of the class [extended_results_provider.ts](../extended_results_provider.ts), which extends [vscode.CodeActionProvider](https://code.visualstudio.com/api/references/vscode-api). The ```extended_results_provider``` checks the documents for the same tokens as the ```hover_provider```, and is connected to vscode's yellow lightbulb popup through the CodeActionProvider interface's ```provideCodeActions```.

The ```extended_results_provider```, when activated through the ```provideCodeActions``` interface, will call the ```liveNotebook.openSideBar``` command. This command, as registered in [extension.ts](../extension.ts), will create a new side panel using [side_panels.ts](../side_panels.ts), or it will retrieve and open a cached side panel, if one exists for the matched token.