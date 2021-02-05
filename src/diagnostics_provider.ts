import { Diagnostic } from "vscode";

import * as vscode from 'vscode';
import TokenMatcher from "./token_matcher";

export default class DiagnositcsProvider {
    private matcher: TokenMatcher;

    constructor(matcher: TokenMatcher) {
        this.matcher = matcher;
    }

    subscribeToDocumentChanges(context: vscode.ExtensionContext, highlights: vscode.DiagnosticCollection): void {
        if (vscode.window.activeTextEditor) {
            this.refreshDiagnostics(vscode.window.activeTextEditor.document, highlights);
        }
        context.subscriptions.push(
            vscode.window.onDidChangeActiveTextEditor(editor => {
                if (editor) {
                    this.refreshDiagnostics(editor.document, highlights);
                }
            })
        );

        context.subscriptions.push(
            vscode.workspace.onDidChangeTextDocument(editor => this.refreshDiagnostics(editor.document, highlights))
        );

        context.subscriptions.push(
            vscode.workspace.onDidCloseTextDocument(doc => highlights.delete(doc.uri))
        );

    }

    refreshDiagnostics(document: vscode.TextDocument, highlights: vscode.DiagnosticCollection): void {
        const diagnostics: vscode.Diagnostic[] = [];
        for (var i = 0; i < document.lineCount; i++) {
            var line: string = document.lineAt(i).text;
            line.split(/[ \t\f]/).filter(s => this.matcher.matchToken(s) != undefined).forEach(
                s => {
                    var li = line.indexOf(s);
                    while (li != -1) {
                        const diagnostic: Diagnostic = new Diagnostic(new vscode.Range(i, li, i, li + s.length), this.matcher.matchToken(s) ?? "undefined type", vscode.DiagnosticSeverity.Information);
                        diagnostics.push(diagnostic);
                        li = line.indexOf(s, li + 1);
                    }
                }
            );
        }
        highlights.set(document.uri, diagnostics);
    }
}