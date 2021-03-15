import * as assert from 'assert';
import * as vscode from 'vscode';
import * as tsSinon from "ts-sinon";
import TestStrategy from '../test_strategy';
import APICalls from '../../api_calls';

suite('Strategy Test Suite',() => {
    /*
    Set up for strategy testing
    */
    const testStrategy : TestStrategy = new TestStrategy(
    {
        "name": "Test Strategy",
        "type": [
            "URL"
        ],
        "mapping": {
            "last_modification_date": "attributes.date",
            "last_analysis_stats": {
                "harmless": "attributes.stats.harmless",
                "malicious": "attributes.stats.malicious",
                "suspicious": "attributes.stats.suspicious",
                "timeout": "attributes.stats.timeout",
                "undetected": "attributes.stats.undetected"
            },
            "total_votes": {
                "harmless": "attributes.stats.harmless",
                "malicious": "attributes.stats.malicious"
            }
        }
    }
    );
    
    // Test the getTokenTypes method
    test("getTokenTypes",()=>{
        assert.deepStrictEqual(testStrategy.getTokenTypes(), ['URL']);
    });

    // Set up tokens to be used in api calls
    const myToken : string = "token";
    const myToken2 : string = "secondToken";
    const myToken3 : string = "thirdToken";

    test("getRawAPIResponse", async ()=>{
        const result = await testStrategy.getAPIRawResponse(myToken);
        assert.deepStrictEqual(result,
        {
            "attributes":{
                "date":100,
                "stats":{
                    "harmless": 89,
                    "malicious": 145,
                    "suspicious": 221,
                    "timeout": 324123,
                    "undetected": 3123
                }
            }
        })
    });

    // Test the new values entered into the cache (which was just filled from the first getRaw call) for
    // the test strategies secret cache value.
    test("getRawAPIResponse - Cache", async()=>{
        const result = await testStrategy.getAPIRawResponse(myToken);
        assert.deepStrictEqual(result, "Secret cached result");
    });

    // Test that the cache does not carry over to a different token
    test("getRaw - Cacheless", async ()=>{
        const result = await testStrategy.getAPIRawResponse(myToken2);
        assert.deepStrictEqual(result,
        {
            "attributes":{
                "date":100,
                "stats":{
                    "harmless": 89,
                    "malicious": 145,
                    "suspicious": 221,
                    "timeout": 324123,
                    "undetected": 3123
                }
            }
        })
    });

    // Test that the common data model formatting works correctly
    test("getResponse - (CDM)", async()=>{
        const result = await testStrategy.getResponse(myToken3);
        assert.deepStrictEqual(result,
        {
            "api_name": "Test Strategy",
            "last_modification_date": 100,
            "last_analysis_stats":
            {
                "harmless": 89,
                "malicious": 145,
                "suspicious": 221,
                "timeout": 324123,
                "undetected": 3123
            },
            "reputation": undefined,
            "tags": undefined,
            "total_votes":
            {
                "harmless": 89,
                "malicious": 145,
            },
            "whois": undefined,
            "link_self": undefined,
            "type": undefined,
            "harmful": undefined
        });
    });
});