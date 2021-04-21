import Axios from "axios";
import { APIStrategy } from "./api_strategy";
const FormData = require('form-data');
import { URLSearchParams } from "url";
var _ = require('lodash');
import { Cache } from "./cache";

/**
 * The API Strategy for GET requests.
 */
export class GetStrategy extends APIStrategy {
    protected async getRawResponse(token: string, cache: Cache<any>) {
        // Check api cache first
        if (cache) {
            let cacheResult = cache.getCachedValue(this.getCacheKey(token));
            if (cacheResult) return cacheResult;
        }

        // Replace all strings of interest with the matched token, URL, IP, EMAIL, etc...
        var withToken = JSON.parse(JSON.stringify(this.apiJSON).replace("{live-notebook.stringOfInterest}", token));

        // Get headers from the configuration
        let configHeaders = _.has(withToken,"headers") ? withToken.headers : "";
        var config = {
            headers: {
                ...configHeaders
            },
        };

        // Check if the api key is in search params
        let keyInParams = _.has(withToken,"query");
        let completedUrl = withToken.url;
        if (keyInParams) completedUrl += "?" + new URLSearchParams(withToken.query);

        // Get data, replace string of interest with the token, add in the headers from the config
        let retval = await Axios.get(completedUrl, config);

        // Cache the data for the token
        if (cache) cache.insertValue(this.getCacheKey(token), retval.data);

        return retval.data;
    }
}