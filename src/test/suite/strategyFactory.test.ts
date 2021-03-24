import * as assert from 'assert';
import * as vscode from 'vscode';
import TokenMatcher from '../../token_matcher';
import APICalls, { CommonDataModel } from '../../api_calls';
import NotebookHoverProvider from '../../hover_provider';
import * as tsSinon from "ts-sinon";
import ConfigManager from '../../config_manager';
import { StrategyFactory } from '../../strategy_factory';
import { GetStrategy } from '../../get_strategy';
import { PostStrategy } from '../../post_strategy';

suite('Strategy Factory Suite',
    () => {
        // Mock config manager to pass to apicalls and token matcher, necessary for test to run
        let mockVSCodeConfig = tsSinon.stubInterface<vscode.WorkspaceConfiguration>();

        // MOCKED WITHOUT SINON'S .WITHARGS, .GET USUALLY TAKES IN A STRING SPECIFYING
        // SECTION OF THE CONFIG SUCH AS .get("apis") or .get("regexes") REMEMBER
        // IF MODIFYING IN THE FUTURE
        mockVSCodeConfig.get.returns(
            [{
                "name": "Google Safe Browsing",
                "url": "https://safebrowsing.googleapis.com/v4/threatMatches:find",
                "method": "POST",
                "type": [
                    "GSB",
                    "SECRET",
                    "TYPES"
                ],
                "query": {
                    "key": "{API_KEY_HERE}"
                },
                "body": {
                    "threatInfo": {
                        "threatTypes": [
                            "UNWANTED_SOFTWARE",
                            "MALWARE",
                            "THREAT_TYPE_UNSPECIFIED",
                            "SOCIAL_ENGINEERING",
                            "POTENTIALLY_HARMFUL_APPLICATION"
                        ],
                        "platformTypes": [
                            "ANY_PLATFORM"
                        ],
                        "threatEntryTypes": [
                            "URL"
                        ],
                        "threatEntries": [
                            {
                                "url": "{live-notebook.stringOfInterest}"
                            }
                        ]
                    }
                },
                "mapping": {
                    "link_self": [
                        "matches",
                        0,
                        "threat",
                        "url"
                    ],
                    "type": "matches[0].threatEntryType"
                }
            },
            {
                "name": "WhoIsXmlAPI",
                "url": "https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=at_eK7TFzDjujemroNcccq6A4ScXF0HN&domainName={live-notebook.stringOfInterest}&outputFormat=JSON",
                "method": "GET",
                "type": [
                    "SECRET",
                    "TOKEN",
                    "TYPES"
                ],
                "mapping": {},
                "isSidePanelAPI": true
            }]
        );

	    const configManager : ConfigManager = new ConfigManager(mockVSCodeConfig, "fake name, not used in testing");

        // Create a strategy factory using the mocked configuration file
        const strategyFactory : StrategyFactory = new StrategyFactory(configManager);

        // Test the sidebar strategy implementation
        let sidePanelStrat = strategyFactory.manufactureSidePanelStrategy();

        test("Creates Sidebar Strategy", async () => {
            assert.notStrictEqual(sidePanelStrat,undefined);
        });

        test("Sidebar Strategy Is Correct Type", async () => {
            assert.strictEqual(true, sidePanelStrat instanceof GetStrategy);
        });

        test("Sidebar Has Correct Matching Types", async () => {
            assert.strictEqual("SECRET",sidePanelStrat?.getTokenTypes()[0]);
            assert.strictEqual("TOKEN",sidePanelStrat?.getTokenTypes()[1]);
            assert.strictEqual("TYPES",sidePanelStrat?.getTokenTypes()[2]);
        });

        // Creates the google safe browsing API in the strategy array
        let strats = strategyFactory.manufactureStrategyArray();

        // Dont want to mix in sidebar strategies with normal APIs
        test("Creates Only Non Sidebar For Strategies Array", async () => {
            assert.strictEqual(strats.length,1);
        });

        test("Array Strategies Have Correct Types", async () => {
            assert.strictEqual(true, strats[0] instanceof PostStrategy);
        });

        // Test that the correct API was created (Google Safe Browsing)
        test("Array Strategies Have Correct Matching Types", async () => {
            assert.strictEqual("GSB",strats[0].getTokenTypes()[0]);
            assert.strictEqual("SECRET",strats[0].getTokenTypes()[1]);
            assert.strictEqual("TYPES",strats[0].getTokenTypes()[2]);
        });
    }
);