import * as vscode from 'vscode';
import { TokenMatcher } from "./token_matcher"
import NotebookHoverProvider from "./hover_provider";
import APICalls from './api_calls';
import { ExtendedResultsProvider } from './extended_results_provider'
import { SidePanels } from "./side_panels";
import DiagnositcsProvider from './diagnostics_provider';
import ConfigManager from './config_manager';

let diagnosticCollection: vscode.DiagnosticCollection;

// The configuration name
const configName : string = 'live-notebook';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// The config manager, manages loading APIs and Regular Expressions
	let globalConfigManager: ConfigManager = new ConfigManager(vscode.workspace.getConfiguration(configName), configName); 
	// The tokenmatcher, used to match otkens in documents
	let globalMatcher: TokenMatcher = new TokenMatcher(globalConfigManager);
	// APICalls, used to call APIs on tokens
	let apiCalls: APICalls = new APICalls(globalConfigManager);

	context.subscriptions.push(
		vscode.languages.registerHoverProvider("plaintext", new NotebookHoverProvider(globalMatcher, apiCalls))
	);

	// Push the extended results provider
	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider('plaintext', new ExtendedResultsProvider(globalMatcher))
	);


	const command = "liveNotebook.openSideBar";
	let tempSideBar = new SidePanels(apiCalls);

	const commandHandle = (stringOfInterest: string) => {
		tempSideBar.onHoverFocus(stringOfInterest);
	};

	context.subscriptions.push(vscode.commands.registerCommand(command, commandHandle));

	// context.subscriptions.push(vscode.getDisposable());
	new DiagnositcsProvider(context, globalMatcher);
}

// this method is called when your extension is deactivated
export function deactivate() { }