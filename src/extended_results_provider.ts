import { start } from 'repl';
import * as vscode from 'vscode';
import { TokenMatcher } from "./token_matcher";

export class ExtendedResultsProvider implements vscode.CodeActionProvider {

	public static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.QuickFix
	];

	provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, tok: vscode.CancellationToken): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
		let tempMatcherObj = new TokenMatcher();
		var matchRange: vscode.Range | undefined = document.getWordRangeAtPosition(range.start, /\S+/);
		if (matchRange !== undefined) {
			var token: string = document.getText(matchRange);
			var type: string | undefined = tempMatcherObj.matchToken(token);
			if (type !== undefined) {
				console.log("Inside provideCode Actions");
				console.log(token);
				const showMoreInfo = this.createFix(document, range, token)
				return [showMoreInfo];
			}
			else { return };
		}
	}

	private createFix(document: vscode.TextDocument, range: vscode.Range, stringOfInterest: string): vscode.CodeAction {
		const fix = new vscode.CodeAction(`View More Info`, vscode.CodeActionKind.QuickFix);
		fix.command = {command: "liveNotebook.openSideBar", title : "Testing", tooltip: "Testing2", arguments: [stringOfInterest]};
		return fix;
	}
}

export default ExtendedResultsProvider;