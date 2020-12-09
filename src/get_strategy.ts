import Axios from "axios";
import { APIStrategy } from "./api_strategy";
const FormData = require('form-data');
var _ = require('lodash');

/**
 * The API Strategy for GET requests.
 */
export class GetStrategy extends APIStrategy {
    protected async getRawResponse(token: string) {
        // Check api shared cache first
        let cache = APIStrategy.getCache();
        let cacheResult = cache.getCachedValue(this.getCacheKey(token));
        if (cacheResult) {
            console.log(this.apiJSON.name + " accessed cache at key " + this.getCacheKey(token));
            return cacheResult;
        }

        // Replace all strings of interest with the matched token, URL, IP, EMAIL, etc...
        var withToken = JSON.parse(JSON.stringify(this.apiJSON).replace("{live-notebook.stringOfInterest}", token));

        // Get headers from the configuration
        let configHeaders = _.has(this.apiJSON,"headers") ? this.apiJSON.headers : "";
        var config = {
            headers: {
                ...configHeaders
            },
        };

        // Get the body from the configuration
        let configBody = _.has(withToken,"body") ? withToken.body : undefined;

        // Get requests do not use bodies, log warning if one exists.
        if (configBody) console.log("WARNING: Body defined for: " + this.apiJSON.name + ", however it is using " +
                                    "a GET request, so this information will not be used.");

        // Get data, replace string of interest with the token, add in the headers from the config
        let retval = await Axios.get(withToken.url, config);

        // Cache the data for the token
        cache.insertValue(this.getCacheKey(token), retval.data);

        return retval.data;
    }
}