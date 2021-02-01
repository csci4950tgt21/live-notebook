import * as vscode from 'vscode';

export class ExtendedResultsProvider implements vscode.CodeActionProvider{

    public static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.QuickFix
    ];
    
    provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
        console.log("Inside provideCode Actions")
        const showMoreInfo = this.createFix(document,range)
        return [showMoreInfo];
    }

    private createFix(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction {
		const fix = new vscode.CodeAction(`View More Info`, vscode.CodeActionKind.QuickFix);
		// fix.edit = new vscode.WorkspaceEdit();
		// fix.edit.replace(document.uri, new vscode.Range(range.start, range.start.translate(0, 2)));
		return fix;
	}


}

export default ExtendedResultsProvider;