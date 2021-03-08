import * as vscode from 'vscode';
import TokenMatcher from "./token_matcher";

export default class DiagnositcsProvider {
    private context: vscode.ExtensionContext;
    private matcher: TokenMatcher;
    private highlights: vscode.DiagnosticCollection;

    constructor(context: vscode.ExtensionContext, matcher: TokenMatcher) {
        this.context = context;
        this.matcher = matcher;
        this.highlights = vscode.languages.createDiagnosticCollection('highlights');
        this.subscribeToDocumentChanges();
    }

    subscribeToDocumentChanges(): void {
        if (vscode.window.activeTextEditor) {
            this.refreshDiagnostics(vscode.window.activeTextEditor.document);
        }
        this.context.subscriptions.push(
            vscode.window.onDidChangeActiveTextEditor(editor => {
                if (editor) {
                    this.refreshDiagnostics(editor.document);
                }
            })
        );

        this.context.subscriptions.push(
            vscode.workspace.onDidChangeTextDocument(editor => this.refreshDiagnostics(editor.document))
        );

        this.context.subscriptions.push(
            vscode.workspace.onDidCloseTextDocument(doc => this.highlights.delete(doc.uri))
        );

    }

    refreshDiagnostics(document: vscode.TextDocument): void {
        const diagnostics: vscode.Diagnostic[] = [];
        for (var i = 0; i < document.lineCount; i++) {
            var line: string = document.lineAt(i).text;
            line.split(/[ \t\f]/).filter(s => this.matcher.matchToken(s) != undefined).forEach(
                s => {
                    var li = line.indexOf(s);
                    while (li != -1) {
                        const diagnostic: vscode.Diagnostic = new vscode.Diagnostic(new vscode.Range(i, li, i, li + s.length),
                            (this.matcher.matchToken(s) ?? "undefined type") + " - " + s, vscode.DiagnosticSeverity.Information);
                        diagnostics.push(diagnostic);
                        li = line.indexOf(s, li + 1);
                    }
                }
            );
        }
        this.highlights.set(document.uri, diagnostics);
    }
}