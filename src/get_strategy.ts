import Axios from "axios";
import { APIStrategy } from "./api_strategy";
const FormData = require('form-data');
var _ = require('lodash');
import * as vscode from 'vscode';
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

        // Get data, replace string of interest with the token, add in the headers from the config
        let retval = await Axios.get(withToken.url, config);

        // Cache the data for the token
        if (cache) cache.insertValue(this.getCacheKey(token), retval.data);

        return retval.data;
    }
}