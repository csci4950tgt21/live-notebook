import { APIStrategy } from "./api_strategy";
import axios from 'axios';
import { URLSearchParams } from "url";
import { Cache } from "./cache";
var _ = require('lodash');

/**
 * The API Strategy for post calls
 */
export class PostStrategy extends APIStrategy {
    protected async getRawResponse(token: string, cache: Cache<any>) {
        // Check api cache first
        if(cache){
            let cacheResult = cache.getCachedValue(this.getCacheKey(token));
            if (cacheResult) return cacheResult;
        }

        // Replace all strings of interest with the matched token, URL, IP, EMAIL, etc...
        var withToken = JSON.parse(JSON.stringify(this.apiJSON).replace("{live-notebook.stringOfInterest}", token));

        // Get headers from the configuration
        let configHeaders = _.has(withToken, "headers") ? withToken.headers : {};
        var config = {
            headers: {
                ...configHeaders
            },
        };

        // Get the body from the configuration
        let configBody = _.has(withToken, "body") ? withToken.body : undefined;

        let retval = await axios.post(withToken.url + "?" + new URLSearchParams(withToken.query), configBody, config);

        // Cache the data for the token
        if (cache) cache.insertValue(this.getCacheKey(token), retval.data);

        return retval.data;
    }
}