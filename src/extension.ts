// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { TokenMatcher } from "./token_matcher"
import NotebookHoverProvider from "./hover_provider";
import APICalls from './api_calls';
import { ExtendedResultsProvider } from './extended_results_provider'
import { SidePanels } from "./side_panels";
import DiagnositcsProvider from './diagnostics_provider';

let diagnosticCollection: vscode.DiagnosticCollection;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let globalMatcher: TokenMatcher = new TokenMatcher();
	let apiCalls: APICalls = new APICalls();

	context.subscriptions.push(
		vscode.languages.registerHoverProvider("plaintext", new NotebookHoverProvider(globalMatcher, apiCalls))
	);
	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider('plaintext', new ExtendedResultsProvider())
	);
	const command = "liveNotebook.openSideBar";
	let tempSideBar = new SidePanels();

	const commandHandle = (stringOfInterest: string) => {
		tempSideBar.onHoverFocus(stringOfInterest, undefined);
	};

	context.subscriptions.push(vscode.commands.registerCommand(command, commandHandle));

	// context.subscriptions.push(vscode.getDisposable());
	let highlights = vscode.languages.createDiagnosticCollection('highlights');
	new DiagnositcsProvider(globalMatcher).subscribeToDocumentChanges(context, highlights);
}

// this method is called when your extension is deactivated
export function deactivate() { }