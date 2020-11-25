import Axios from "axios";
import { APIStrategy } from "./api_strategy";
const FormData = require('form-data');
var _ = require('lodash');

/**
 * The API Strategy for GET requests.
 * 
 * WARNING: THIS STRATEGY MAY FAIL IF YOUR API DOES
 * NOT WORK WITH THE FOLLOWING FORMATS.
 * 
 * Valid formats:
 * 1. Your api takes both the token (url, email, ip) and
 * the api key in the url request. And can ignore empty
 * headers, or has preset headers that are loaded from
 * the config.
 * 
 * 2. Your api takes both the url and
 * the api key in a headers section (which must be defined
 * in the config). And puts the token in the url outside of
 * the headers in the GET request.
 * 
 * 3. Any combination of the above mentioned capabilities.
 */
export class GetStrategy extends APIStrategy {
    protected async getRawResponse(token: string) {
        // Get values out of loaded config data
        let api_url : string = this.apiJSON.url;
        var api_key : string = this.apiJSON.query.key;

        // Check that the key is defined
        if (api_key == undefined) return Promise.reject("VirusTotal API Key Undefined");

        // Create the headers for the api
        let api_headers = {...this.apiJSON.headers};
        
        // Iterate through the api headers
        Object.keys(api_headers).forEach(function(key) {
            if (typeof(api_headers[key]) == "string") {
                // Replace the apiKey in the headers, if it exists
                if ((<string>api_headers[key]).match("{live-notebook.apiKey}")) {
                    api_headers[key] = api_key;
                }
                // Replace the url in the headers, if it exists
                if ((<string>api_headers[key]).match("{live-notebook.url}")) {
                    api_headers[key] = api_url;
                }
            }
        });

        // Get data, replace string of interest with the token, add in the headers from the config
        let retval = await Axios.get(api_url.replace("{live-notebook.stringOfInterest}",token).replace("{live-notebook.apiKey}",api_key),{
            headers: {
                ...api_headers
            }
        });

        return retval.data;
    }
}