// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { TokenMatcher } from "./token_matcher"
import NotebookHoverProvider from "./hover_provider";
import APICalls from './api_calls';
import {ExtendedResultsProvider} from './extended_results_provider'
import { SidePanels } from "./side_panels";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	let myAPICalls: APICalls = new APICalls();

	// Push the main hover provider
	context.subscriptions.push(
		vscode.languages.registerHoverProvider("plaintext", new NotebookHoverProvider(new TokenMatcher(), myAPICalls))
	);

	// Push the extended results provider
	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider('plaintext', new ExtendedResultsProvider())
	);
	
	
	const command = "liveNotebook.openSideBar";
	let tempSideBar = new SidePanels(myAPICalls);

	const commandHandle = (stringOfInterest: string) => {
		tempSideBar.onHoverFocus(stringOfInterest);
	};

	context.subscriptions.push(vscode.commands.registerCommand(command, commandHandle));
	
}

// this method is called when your extension is deactivated
export function deactivate() { }