## Text Decorations w/ Underline

The underlines are provided using the [diagnostics](https://code.visualstudio.com/api/language-extensions/programmatic-language-features#provide-diagnostics) API of VS Code. A global [`DiagnositcsProvider`](../src/diagnostics_provider.ts) instantiated in [extension.ts](.#extensionts) subsribes to document changes and updates and pushes a list of [`Diagnostic`](https://code.visualstudio.com/api/references/vscode-api#Diagnostic) to update the underlines.