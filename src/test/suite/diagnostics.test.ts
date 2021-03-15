import * as assert from 'assert';
import * as vscode from 'vscode';
import TokenMatcher from '../../token_matcher';
import sinon from "ts-sinon";
import * as tsSinon from "ts-sinon";
import DiagnositcsProvider from '../../diagnostics_provider';
import ConfigManager from '../../config_manager';

suite('Diagnostics (Highlights) Test Suite',
    () => {
        const mockContext = { ...tsSinon.stubInterface<vscode.ExtensionContext>(), subscriptions: [] };
        sinon.stub(mockContext, "subscriptions").value([]);
        const onDidChangeActiveTextEditor = sinon.stub(vscode.window, "onDidChangeActiveTextEditor").returns(tsSinon.stubConstructor(vscode.Disposable));
        onDidChangeActiveTextEditor.returns(tsSinon.stubConstructor(vscode.Disposable));
        const onDidChangeTextDocument = sinon.stub(vscode.workspace, "onDidChangeTextDocument").returns(tsSinon.stubConstructor(vscode.Disposable));
        onDidChangeTextDocument.returns(tsSinon.stubConstructor(vscode.Disposable));
        const onDidCloseTextDocument = sinon.stub(vscode.workspace, "onDidCloseTextDocument").returns(tsSinon.stubConstructor(vscode.Disposable));
        onDidCloseTextDocument.returns(tsSinon.stubConstructor(vscode.Disposable));

        // Mock config manager to pass to  token matcher, necessary for test to run
        let mockVSCodeConfig = tsSinon.stubInterface<vscode.WorkspaceConfiguration>();
        mockVSCodeConfig.get.returns(
            {"regexes" : []}
        );
	    const configManager : ConfigManager = new ConfigManager(mockVSCodeConfig, "fake name, not used in testing");

        const mockMatcher = tsSinon.stubConstructor(TokenMatcher, configManager);
        mockMatcher.matchToken.withArgs("TEST TEXT").returns("TEST TYPE");
        const diagnosticsProvider = new DiagnositcsProvider(mockContext, mockMatcher);

        test("subscribeToDocumentChanges on construction", () => {
            assert.strictEqual(onDidChangeActiveTextEditor.called, true);
            assert.strictEqual(onDidChangeTextDocument.called, true);
            assert.strictEqual(onDidCloseTextDocument.called, true);
        });

        test("refreshDiagnostics", () => {
            const mockDoc = { ...tsSinon.stubInterface<vscode.TextDocument>({ lineAt: <vscode.TextLine>{ text: "TEST" } }), lineCount: 1 };
            diagnosticsProvider.refreshDiagnostics(mockDoc);
            assert.strictEqual(mockMatcher.matchToken.calledWith("TEST"), true);
        });
    }
);