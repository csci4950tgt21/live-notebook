import { CommonDataModel } from "./api_calls"

/**
 * An API strategy 
 */
export abstract class APIStrategy {
    // The JSON for the API
    private apiJSON: any;

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

    // TODO
    protected abstract async getRawResponse(token: string): Promise<any>;

    // TODO: Error Checking,
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

    private asCommonDataModel(response: JSON | undefined): CommonDataModel {
        if (response == undefined) return { api_name: this.apiJSON.name };
        else return <CommonDataModel>this.normalize(this.apiJSON.mapping, {});
    }
}