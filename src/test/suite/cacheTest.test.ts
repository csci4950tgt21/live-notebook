import * as assert from 'assert';
import { REFUSED } from 'dns';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { Cache } from "../../cache";
import { MapCache } from "../../map_cache";

suite('Cache Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	/**
	 * Setup for the map cache unit tests.
	 * The map cache unit test
	 * tests the mapcache implementation
	 * of the cache interface.
	 */
	let apiCache: Cache<any>;
	apiCache = new MapCache();

	let replicateKey1 = "213m0re5";
	let replicateValue1 = 2;
	let replicateValue2 = "{vt response}";

	enum Color{RED,YELLOW,INDIGO};
	let replicateKey3 = Boolean;
	let replicateValue3 = Color.INDIGO;

	apiCache.insertValue(replicateKey1,replicateValue1);
	apiCache.insertValue(replicateKey3,replicateValue3);

	test("getCachedValue",()=>{
		// Test getCachedValue
		assert.strictEqual(apiCache.getCachedValue(replicateKey1),replicateValue1);
		assert.strictEqual(apiCache.getCachedValue(replicateKey3),replicateValue3);
	});

	test("insertValue",()=>{
		// Test insertValue
		apiCache.insertValue(replicateKey1,replicateValue2);
		assert.strictEqual(apiCache.getCachedValue(replicateKey1),replicateValue2);
	});

	test("clearCache",()=>{
		apiCache.clearCache();
		assert.strictEqual(apiCache.getCachedValue(replicateKey1),undefined);
		assert.strictEqual(apiCache.getCachedValue(replicateKey3),undefined);
	})
});