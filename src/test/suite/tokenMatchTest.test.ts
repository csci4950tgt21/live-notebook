import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { TokenMatcher } from "../../token_matcher";

suite('Token Matcher Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	let tokenMatcher = new TokenMatcher()
	
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