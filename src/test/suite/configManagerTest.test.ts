import * as vscode from 'vscode';
import * as tsSinon from "ts-sinon";
import { ConfigManager } from "../../config_manager";
import * as assert from 'assert';

suite('Config Manager Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');
	let mockVSCodeConfig = tsSinon.stubInterface<vscode.WorkspaceConfiguration>();
	let response = {"regexes" : ["sampleRegex"], "apis":["sampleAPIs"]};
	mockVSCodeConfig.get.returns(
		response
	);
	const configManager : ConfigManager = new ConfigManager(mockVSCodeConfig, "fake name, not used in testing");

	test("getTypedRegexes",()=>{
		assert.strictEqual(configManager.getTypedRegexes(), response);
	});

	test("getAPIData",()=>{
		assert.notStrictEqual(configManager.getAPIData(), []);
	});
});