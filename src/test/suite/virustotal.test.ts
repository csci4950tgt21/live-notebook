import * as assert from 'assert';
import axios from 'axios';
import sinon from "ts-sinon";
import * as tsSinon from "ts-sinon";
import { Cache } from '../../cache';
import { MapCache } from '../../map_cache';
import VirusTotalStrategy from '../../virus_total_strategy';

suite('VirusTotal Strategy Test Suite',() => {
    /*
    Set up for virus total strategy testing
    */
    let cache : Cache<any> = new MapCache();

    const mockedID : number = 1;
    const VTStrategy : VirusTotalStrategy = new VirusTotalStrategy (
    {
        "name": "VirusTotal URL",
        "url": "https://www.virustotal.com/api/v3/urls",
        "vturl2": "https://www.virustotal.com/api/v3/analyses/",
        "method": "VirusTotal",
        "type": [
            "URL"
        ],
        "headers": {
            "x-apikey": "{API_KEY_HERE}"
        },
        "mapping": {
            "last_analysis_stats": {
                "harmless": "attributes.stats.harmless",
                "malicious": "attributes.stats.malicious",
                "suspicious": "attributes.stats.suspicious",
                "timeout": "attributes.stats.timeout",
                "undetected": "attributes.stats.undetected"
            },
        }
    }, mockedID);
    
    // Test the getTokenTypes method
    test("getTokenTypes",()=>{
        assert.deepStrictEqual(VTStrategy.getTokenTypes(), ['URL']);
    });

    // The status of a vt total request tells us if data is queued and currently blank,
    // or if it is finished and correct
    axios.post = sinon.stub().returns({
        "id": 100,
        "attributes":{
            "status": "queued",
            "stats":{
                "harmless": 1,
                "malicious": 0,
                "suspicious": 0,
                "timeout": 0,
                "undetected": 0
            }
        }
    });

    // Make the call
    const queryResult = VTStrategy.getResponse("myToken", cache);

    test("Initial Query Correct", () => {
        async() => {
            assert.strictEqual((await queryResult).last_analysis_stats?.harmless, 1);
            assert.strictEqual((await queryResult).last_analysis_stats?.malicious, 0);
            assert.strictEqual((await queryResult).last_analysis_stats?.suspicious, 0);
            assert.strictEqual((await queryResult).last_analysis_stats?.timeout, 0);
            assert.strictEqual((await queryResult).last_analysis_stats?.undetected, 0);
        }
    });

    let cacheKey = "{1} myToken";

    // Check that the id of the virus total request was cached
    test("Virus Total Query ID Cached", () => {
        queryResult.then(() => {
            console.log(cache.getCachedValue(cacheKey));
            assert.strictEqual(cache.getCachedValue(cacheKey).id, 100);
        });
    });
    
    // VT should not cache the initial response, as it is incorrect data,
    // change one value and check that it did not cache the initial response.
    // The new call will be a get call, because we now have an ID for our query
    axios.get = sinon.stub().returns({
        "id": 100,
        "attributes":{
            "status": "queued",
            "stats":{
                "harmless": 123,
            }
        }
    });

    const queryResult2 = queryResult.then(() => {
        let queryResult2 = VTStrategy.getResponse("myToken", cache);
        return queryResult2;
    });

    test("Initial Query Not Cached", () => {
        queryResult2.then((myResult) => {
            assert.strictEqual(cache.getCachedValue(cacheKey).id, 100);
            assert.strictEqual(myResult.last_analysis_stats?.harmless, 123);
        });
    });

    // Now supply a non queued reply
    axios.get = sinon.stub().returns({
        "id": 100,
        "attributes":{
            "status": "Anything but queued here",
            "stats":{
                "harmless": 5,
                "malicious": 10,
                "suspicious": 3,
                "timeout": 5,
                "undetected": 67
            }
        }
    });

    const queryResult3 = queryResult2.then(() => {
        let queryResult3 = VTStrategy.getResponse("myToken", cache);
        return queryResult3;
    });

    test("Initial Cacheable result", () => {
        queryResult3.then((myResult) => {
            assert.strictEqual(cache.getCachedValue(cacheKey).id, 100);
            assert.strictEqual(myResult.last_analysis_stats?.harmless, 5);
            assert.strictEqual(myResult.last_analysis_stats?.malicious, 10);
            assert.strictEqual(myResult.last_analysis_stats?.suspicious, 3);
            assert.strictEqual(myResult.last_analysis_stats?.timeout, 5);
            assert.strictEqual(myResult.last_analysis_stats?.undetected, 67);
        });
    });

    // Now that response should have been cached, so when we make the call again,
    // it should return the same results, and not the values we stub below.
    axios.get = sinon.stub().returns({
        "id": 123232,
        "attributes":{
            "status": "Anything but queued here",
            "stats":{
                "harmless": 532,
                "malicious": 102131,
                "suspicious": 32,
                "timeout": 531223,
                "undetected": 67123
            }
        }
    });

    const queryResult4 = queryResult3.then(() => {
        let queryResult4 = VTStrategy.getResponse("myToken", cache);
        return queryResult4;
    });

    test("Results Correctly Cached", () => {
        queryResult3.then((myResult) => {
            assert.notStrictEqual(cache.getCachedValue(cacheKey).id, 100);
            assert.strictEqual(myResult.last_analysis_stats?.harmless, 5);
            assert.strictEqual(myResult.last_analysis_stats?.malicious, 10);
            assert.strictEqual(myResult.last_analysis_stats?.suspicious, 3);
            assert.strictEqual(myResult.last_analysis_stats?.timeout, 5);
            assert.strictEqual(myResult.last_analysis_stats?.undetected, 67);
        });
    });
});