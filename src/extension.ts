// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import RegexManager from "./regex_manager"
import NotebookHoverProvider from "./hover_provider";
import APICalls from './api_calls';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.languages.registerHoverProvider("plaintext", new NotebookHoverProvider(new RegexManager(), new APICalls()))
	);
}

// this method is called when your extension is deactivated
export function deactivate() { }
