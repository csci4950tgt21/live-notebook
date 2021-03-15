import { APIStrategy } from "../api_strategy";
import axios from 'axios';
import { Cache } from "../cache";

/**
 * Strategy meant for unit testing purposes.
 */
export default class TestStrategy extends APIStrategy {
    protected async getRawResponse(token: string, cache : Cache<any>): Promise<any> {
        // Check cache first
        if (cache) {
            let cacheResult = cache.getCachedValue(this.getCacheKey(token));
            if (cacheResult) return cacheResult;
        }

        // Cache the secret data for the token, 
        // will return next time getRawResponse is called
        if (cache) cache.insertValue(this.getCacheKey(token), "Secret cached result");

        // Fake return data for the initial values
        return Promise.resolve(
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
            }
        );
    }
}