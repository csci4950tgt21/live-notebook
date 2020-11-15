/**
 * An API strategy 
 */
export abstract class APIStrategy {
    // The JSON for the API
    private apiJSON : JSON;

    constructor(apiJSON : JSON) {
        this.apiJSON = apiJSON;
    }

    /**
     * Get the common data model response
     * @param token The parsed text token, for example a URL.
     */
    public getCDMresponse(token : string) {
        return APIStrategy.mapResponseToCDM(this.getReponse(token));
    }

    // TODO
    protected abstract getReponse(token : string) : JSON | undefined;

    // TODO
    private static mapResponseToCDM(reponse : JSON | undefined) {
        // TODO
    }
}