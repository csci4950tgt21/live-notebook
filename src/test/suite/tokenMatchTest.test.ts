import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import ConfigManager from '../../config_manager';
import * as tsSinon from "ts-sinon";
import { TokenMatcher } from "../../token_matcher";

suite('Token Matcher Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	// Mock a vscode configuration
	let mockVSCodeConfig = tsSinon.stubInterface<vscode.WorkspaceConfiguration>();
	mockVSCodeConfig.get.returns(
		[
			{
				"type": "URL",
				"regex": "(?<=\\s|^)(https?://)?(www\\.)?[a-z0-9]+([\\-\\.]{1}[a-z0-9]+)*\\.[a-z]{2,5}(:[0-9]{1,5})?(/.*)?(?=\\s|$)"
			},
			{
				"type": "IP",
				"regex": "(?<=\\s|^)(\\d{1,3}\\.){3}\\d{1,3}(?=\\s|$)|(?<=\\s|^)(\\w{1,4}\\:){7}\\w{1,4}(?=\\s|$)|(?<=\\s|^)\\w{1,4}\\:(\\w{0,4}\\:){5}\\w{1,4}(?=\\s|$)"
			},
			{
				"type": "EMAIL",
				"regex": "(?<=\\s|^)[a-z0-9\\-\\.\\+]+@[a-z0-9\\-]+\\.[a-z0-9]+(?=\\s|$)"
			}
		]
	);

	const configManager : ConfigManager = new ConfigManager(mockVSCodeConfig, "fake name, not used in testing");

	let tokenMatcher = new TokenMatcher(configManager);
	
	test("matchToken loadConfig",()=>{
		// Test matchToken URL
		assert.doesNotThrow(() => tokenMatcher.loadConfig())
	});
	
	test("matchToken URL",()=>{
		// Test matchToken URL
		assert.strictEqual(tokenMatcher.matchToken("target.com"),"URL");
		assert.strictEqual(tokenMatcher.matchToken("https://target.com"),"URL");
		assert.strictEqual(tokenMatcher.matchToken("www.target.com"),"URL");
	});

	test("matchToken IP",()=>{
		// Test matchToken IP
		assert.strictEqual(tokenMatcher.matchToken("192.168.1.1"),"IP");
		assert.strictEqual(tokenMatcher.matchToken("151.101.66.187"),"IP");
		assert.strictEqual(tokenMatcher.matchToken("0.0.0.0"),"IP");
	});

	test("matchToken EMAIL",()=>{
		// Test matchToken EMAIL
		assert.strictEqual(tokenMatcher.matchToken("admin@target.com"),"EMAIL");
		assert.strictEqual(tokenMatcher.matchToken("support@umn.edu"),"EMAIL");
	});
});