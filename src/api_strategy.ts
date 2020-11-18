import { CommonDataModel } from "./api_calls"
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

    constructor(apiJSON: any) {
        this.apiJSON = apiJSON;
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
    protected abstract async getRawResponse(token: string): Promise<any>;

    /**
     * Use the api specific mapping from the api json to map from the
     * api response to the common data model.
     * @param mapping The mapping from an api response to the common data model, provided in package.json
     * @param response The raw api response to be mapped
     */
    private normalize(mapping: any, response: any): CommonDataModel {
        const normalizedResponse: CommonDataModel = {
            api_name: this.apiJSON.name,
            last_modification_date: _.get(response,mapping.last_modification_date),
            last_analysis_stats: {
                harmless: _.get(response,mapping.last_analysis_stats.harmless),
                malicious: _.get(response,mapping.last_analysis_stats.malicious),
                suspicious: _.get(response,mapping.last_analysis_stats.suspicious),
                timeout: _.get(response,mapping.last_analysis_stats.timeout),
                undetected: _.get(response,mapping.last_analysis_stats.undetected),
            },
            reputation: _.get(response,mapping.reputation),
            tags: _.get(response,mapping.tags),
            total_votes: {
                harmless: _.get(response,mapping.total_votes.harmless),
                malicious: _.get(response,mapping.total_votes.malicious),
            },
            whois: _.get(response,mapping.whois),
            link_self: _.get(response,mapping.link_self),
            type: _.get(response,mapping.type),
            harmful: _.get(response,mapping.harmful)
        }
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
}