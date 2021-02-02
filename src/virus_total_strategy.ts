import { APIStrategy } from "./api_strategy";
import axios from 'axios';
import { CommonDataModel } from "./api_calls";
import { Console } from "console";
import { resolve } from "promise";
const FormData = require('form-data');

/**
 * The VirusTotalStrategy is a special implementation
 * specifically designed for the VirusTotal API, due to
 * its unique calling method, which requires GET and POST
 * calls. As well as the usage of form data for post.
 */
export default class VirusTotalStrategy extends APIStrategy {
    protected async getRawResponse(token: string): Promise<any> {
        // Set up caching
        let cache = APIStrategy.getSharedCache();
        let cacheKey = this.getCacheKey(token);
        let cacheResult = <any>cache.getCachedValue(cacheKey);

        // If the cache is a completed VT response, return it
        if (cacheResult && !(cacheResult.liveNotebookIDFlag) && cacheResult.attributes.status === "completed") {
            return cacheResult;
        }
        // The cache is for an ID, resolve the ID w/ virus total analysis
        else if (cacheResult && (cacheResult.liveNotebookIDFlag || cacheResult.attributes.status === "queued")) {
            // Make a get request with the id, to see if we have valid data yet.
            let getPromise = this.getVTIDResponse(cache.getCachedValue(cacheKey).id);

            // Get the result
            let VTResult = await getPromise.then((resp: any) => resp);

            // Replace the old cached id, with the new analysis response
            // we strip off the data tag on VT in our mapping, but
            // we could just cache VTResult and it would work the same.
            cache.replaceValue(cacheKey, VTResult.data);

            return cache.getCachedValue(cacheKey);
        } 
        // We don't have a cached result or id, make initial call to virus total for an ID
        else {
            // Make the post request
            let postPromise = this.postVTToken(token);

            if (postPromise === undefined) {
                console.error("Failed to get Virus Total URL result, token was: "+token);
                return undefined;
            } else {
                // Get the unmodified Virus Total result
                let VTResult = await postPromise.then((resp: any) => resp);
                
                // Modify the Virus Total result to include the idflag,
                // This lets us know that this is not an analysis result,
                // and just contains the id, instead of id + data.
                VTResult.liveNotebookIDFlag = "exists";

                // Insert the modified result into cache
                cache.insertValue(cacheKey, VTResult);
                return undefined;
            }
        }
    }

    /**
     * POST the token (IP, URL, etc) to the virus total API
     * and return the api response.
     */
    private async postVTToken(token: string): Promise<any | undefined> {
        // Get the url to post to from the config
        let api_url = this.apiJSON.url;

        // Create form data
        var formData = new FormData();
        // Append the token as "url", which will be posted in the body
        formData.append("url", token);

        // Create the headers, formdata.getheaders() provides
        // information saying that the body is in formdata form.
        let virus_total_header = {
            headers: {
                ...formData.getHeaders(),
                ...this.apiJSON.headers
            },
        };

        let retval = await axios.post(api_url, formData, virus_total_header);

        // All axios results have a data field
        let result = retval.data;

        // All VT responses have a data field, (this is retval.data.data now)
        if (result.data) {
            let resultData = result.data;
            // Make sure that the id field exists
            if (resultData.id) {
                return resultData;
            }
        }

        // If the request failed to return an id
        return undefined;
    }

    /**
     * Send a GET HTTP to Virus Total with the ID of
     * the data we want to get back.
     * Return the api response.
     */
    private async getVTIDResponse(id: string): Promise<any | undefined> {
        // Add the id to the analysis VT url
        let urlWithID = this.apiJSON.vturl2 + id;

        // Create the GET headers (don't need form data headers for GET)
        let virus_total_header = {
            headers: {
                ...this.apiJSON.headers
            },
        };

        // Make the GET request
        let retval = await axios.get(urlWithID, virus_total_header);

        // Return the result without axios' data wrapper
        return retval.data;
    }
}