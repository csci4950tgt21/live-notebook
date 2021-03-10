import { CommonDataModel } from "./api_calls"
import { Cache } from "./cache";
import { MapCache } from "./map_cache";
var _ = require('lodash');

/**
 * An API strategy is an abstract class
 * meant to provide interface functionality
 * when getting a response from an API.
 * Each strategy implements its own version
 * of getRawResponse, and the APIStrategy
 * parent abstract class provides context
 * to the strategy in the form of apiJSON,
 * and top level mapping methods to convert
 * the raw response into a useable common
 * data model.
 */
export abstract class APIStrategy {
    // The JSON for the API
    protected apiJSON: any;

    // The unique instance ID for the API,
    // used for caching
    protected apiID: number;

    // The static counter used for creating a unique API ID
    // NOT THREAD SAFE
    private static apiCounter = 0;

    constructor(apiJSON: any) {
        this.apiJSON = apiJSON;

        // Increment api counter, set the apiID
        this.apiID = APIStrategy.getNextApiID();
    }

    /**
     * @returns The next api ID, incremented by 1 each time
     */
    private static getNextApiID(): number {
        APIStrategy.apiCounter++;
        // Overflow protection
        if (APIStrategy.apiCounter < 0) {
            APIStrategy.apiCounter = 0;
            throw new Error("Number of APIs exceeded maximum integer length!");
        }
        return APIStrategy.apiCounter;
    }

    /**
     * A function to be called by API_Calls,
     * this couples the two classes tightly for now,
     * a potential fix would be to pass in the API ID
     * from outside the class. API Factory in config manager or API calls, etc
     */
    public static resetAPICounter(){
        this.apiCounter = 0;
    }

    /**
     * Get the common data model response
     * @param token The parsed text token, for example a URL.
     */
    public async getResponse(token: string): Promise<CommonDataModel> {
        return this.asCommonDataModel(await this.getRawResponse(token));
    }

    /**
     * @returns The type of tokens accepted, URL, IP, etc...
     */
    public getTokenTypes(): string[] {
        return this.apiJSON.type;
    }

    /**
     * The raw response interface function
     * @param token The parsed text token, for example a URL.
     */
    protected abstract getRawResponse(token: string): Promise<any>;

    public getAPIRawResponse(token: string): Promise<any> {
        return this.getRawResponse(token);
    }
    /**
     * Use the api specific mapping from the api json to map from the
     * api response to the common data model.
     * @param mapping The mapping from an api response to the common data model, provided in package.json
     * @param response The raw api response to be mapped
     */
    private normalize(mapping: any, response: any): CommonDataModel {
        const normalizedResponse: CommonDataModel = {
            api_name: this.apiJSON.name,
            last_modification_date: _.get(response, _.get(mapping, "last_modification_date", undefined), undefined),
            last_analysis_stats: _.get(response,_.get(mapping, "last_analysis_stats", undefined), undefined) ?? {
                harmless: _.get(response,_.get(mapping, "last_analysis_stats.harmless", undefined), undefined),
                malicious: _.get(response,_.get(mapping, "last_analysis_stats.malicious", undefined), undefined),
                suspicious: _.get(response,_.get(mapping, "last_analysis_stats.suspicious", undefined), undefined),
                timeout: _.get(response,_.get(mapping, "last_analysis_stats.timeout", undefined), undefined),
                undetected: _.get(response,_.get(mapping, "last_analysis_stats.undetected", undefined), undefined),
            },
            reputation: _.get(response,_.get(mapping, "reputation", undefined), undefined),
            tags: _.get(response,_.get(mapping, "tags", undefined), undefined),
            total_votes: _.get(response,_.get(mapping, "total_votes", undefined), undefined) ?? {
                harmless: _.get(response,_.get(mapping, "total_votes.harmless", undefined), undefined),
                malicious: _.get(response,_.get(mapping, "total_votes.malicious", undefined), undefined),
            },
            whois: _.get(response,_.get(mapping, "whois", undefined), undefined),
            link_self: _.get(response,_.get(mapping, "link_self", undefined), undefined),
            type: _.get(response,_.get(mapping, "type", undefined), undefined),
            harmful: _.get(response,_.get(mapping, "harmful", undefined), undefined)
        } ?? response;
        return normalizedResponse;
    }

    /**
     * @param response The raw api reponse to be converted to the common data model format
     * @returns A common data model version of the response.
     */
    private asCommonDataModel(response: JSON | undefined): CommonDataModel {
        if (response == undefined) return { api_name: this.apiJSON.name };
        return <CommonDataModel>this.normalize(this.apiJSON.mapping, response);
    }

    /**
     * Get a unique caching key for the API
     * and a lookup value, such as a url, email, ip, etc...
     */
    protected getCacheKey(lookupVal: string): string {
        return "{" + this.apiID + "} " + lookupVal;
    }

    private static apiCache: Cache<any>;
    /**
     * Allows access to a universal cache
     * for all strategies to share. Strategies should
     * use getCacheKey when inserting and retrieving
     * values from the cache.
     */
    protected static getSharedCache(): Cache<any> {
        if (!this.apiCache) {
            this.apiCache = new MapCache();
        }
        return this.apiCache;
    }

    /**
     * Another tightly coupled method to
     * be called from API_Calls
     */
    public static clearAPICache(){
        this.apiCache.clearCache();
    }
}