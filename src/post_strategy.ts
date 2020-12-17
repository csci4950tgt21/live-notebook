import { APIStrategy } from "./api_strategy";
import axios from 'axios';
import { URLSearchParams } from "url";
var _ = require('lodash');

/**
 * The API Strategy for post calls
 */
export class PostStrategy extends APIStrategy {
    protected async getRawResponse(token: string) {
        // Check api shared cache first
        let cache = APIStrategy.getSharedCache();
        let cacheResult = cache.getCachedValue(this.getCacheKey(token));
        if (cacheResult) return cacheResult;

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

        // Post requests usually use bodies, log warning if one does not exist.
        if (!configBody) console.log("WARNING: Body undefined for: " + this.apiJSON.name + ", and it is using " +
            "a POST request, so it may be missing information.");

        let retval = await axios.post(withToken.url + "?" + new URLSearchParams(withToken.query), configBody, config);

        // Cache the data for the token
        cache.insertValue(this.getCacheKey(token), retval.data);

        return retval.data;
    }
}