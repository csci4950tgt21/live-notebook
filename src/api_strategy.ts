import { CommonDataModel } from "./api_calls"

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
     * Recursively normalize a raw response to the common data model format.
     * @param mapping The mapping from an api response to the common data model, provided in package.json
     * @param response The raw api response to be mapped
     */
    private normalize(mapping: object | string, response: object | string): object | string {
        if (typeof mapping == "string") {
            return (<string>response).split('.').reduce((o, k) => o[k], <any>response);
        } else {
            var normalized: any = {};
            for (const [k, v] of <any>mapping)
                normalized[k] = this.normalize(v, response);
            return normalized;
        }
    }

    /**
     * @param response The raw api reponse to be converted to the common data model format
     * @returns A common data model version of the response.
     */
    private asCommonDataModel(response: JSON | undefined): CommonDataModel {
        if (response == undefined) return { api_name: this.apiJSON.name };
        console.log(JSON.stringify(response));
        return <CommonDataModel>this.normalize(this.apiJSON.mapping, response);
    }
}