#### The Configuration

The configuration is loaded dynamically and may be changed by the user. Internally VS Code's configuration is stored in [config_manager.ts](../config_manager.ts) as an instance of [vscode.WorkspaceConfiguration](https://code.visualstudio.com/api/references/vscode-api).

The [```ConfigManager```](../config_manager.ts) is instantiated globally in [extension.ts](../extension.ts) and is passed there into the constructors of [```TokenMatcher```](../token_matcher.ts) and [```APICalls```](../api_calls.ts).

The [```ConfigManager```](../config_manager.ts) will load regexes, and APIs. It will sanitize loaded APIs to ensure they follow the correct format for internal use, and will discard APIs that do not conform.