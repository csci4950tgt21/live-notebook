import * as assert from 'assert';
import * as vscode from 'vscode';
import TokenMatcher from '../../token_matcher';
import APICalls, { CommonDataModel } from '../../api_calls';
import NotebookHoverProvider from '../../hover_provider';
import * as tsSinon from "ts-sinon";
import ConfigManager from '../../config_manager';

suite('Hover Test Suite',
    () => {
        // Mock config manager to pass to apicalls and token matcher, necessary for test to run
        let mockVSCodeConfig = tsSinon.stubInterface<vscode.WorkspaceConfiguration>();
        mockVSCodeConfig.get.returns(
            {"apis" : [],
             "regexes" : []}
        );
	    const configManager : ConfigManager = new ConfigManager(mockVSCodeConfig, "fake name, not used in testing");

        const mockMatcher = tsSinon.stubConstructor(TokenMatcher,configManager);
        mockMatcher.matchToken.withArgs("TEST TEXT").returns("TEST TYPE");

        const mockAPICalls = tsSinon.stubConstructor(APICalls,configManager);
        mockAPICalls.getResponse.returns(Promise.allSettled(
            [Promise.resolve(<CommonDataModel>{
                api_name: "TEST API"
            })]
        ));
        const hoverProvider = new NotebookHoverProvider(mockMatcher, mockAPICalls);
        const mockDoc = tsSinon.stubInterface<vscode.TextDocument>();
        const mockRange = tsSinon.stubObject(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0)));
        mockDoc.getWordRangeAtPosition.returns(mockRange);
        mockDoc.getText.returns("TEST TEXT");
        const pos = tsSinon.stubConstructor(vscode.Position);

        test("providerHover", async () => {
            const hover = await hoverProvider.provideHover(mockDoc, pos, tsSinon.stubInterface<vscode.CancellationToken>());
            assert.strictEqual(mockMatcher.matchToken.calledWith("TEST TEXT"), true);
            assert.strictEqual(mockAPICalls.getResponse.calledWith("TEST TYPE", "TEST TEXT"), true);
        });
    }
);