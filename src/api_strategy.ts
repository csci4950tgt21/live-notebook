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
    public getCDMresponse(token: string) {
        return this.mapResponseToCDM(this.getReponse(token));
    }

    // TODO
    protected abstract getReponse(token: string): JSON | undefined;

    // TODO
    private mapResponseToCDM(reponse: JSON | string | undefined): CommonDataModel {
        let res: CommonDataModel = this.apiJSON.mapping;
        // return Object.keys(res).map((k, i) => this.mapResponseToCDM(mappings[k]));
    }
}