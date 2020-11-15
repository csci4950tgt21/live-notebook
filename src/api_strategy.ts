import { CommonDataModel } from "./api_calls"

/**
 * An API strategy 
 */
export abstract class APIStrategy {
    // The JSON for the API
    private apiJSON: any;

    constructor(apiJSON: JSON) {
        this.apiJSON = apiJSON;
    }

    /**
     * Get the common data model response
     * @param token The parsed text token, for example a URL.
     */
    public getCDMresponse(token: string): CommonDataModel {
        return this.mapResponseToCDM(this.getReponse(token));
    }

    /**
     * @returns The type of tokens accepted, URL, IP, etc...
     */
    public getTokenType(): string[] {
        return this.apiJSON.type;
    }

    // TODO
    protected abstract getReponse(token: string): JSON | undefined;

    private normalize(response: object | string): any {
        if (typeof response == "string")
            return (<string>response).split('.').reduce((o, k) => o[k], this.apiJSON.mapping);
        else for (const [k, v] of this.apiJSON.mapping)
            (<any>response)[k] = this.normalize(v);
    }

    // TODO
    private mapResponseToCDM(response: JSON | undefined): CommonDataModel {
        if (response == undefined) return {};
        else return <CommonDataModel>this.normalize(response);
    }
}