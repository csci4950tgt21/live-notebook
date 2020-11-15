import APIKEYS from "./apiKEYS";

const axios = require('axios').default;

type CommonDataModel = {
    "last_modification_date" : number | string | undefined,
    "last_analysis_stats" : {
        "harmless" : number | undefined,
        "malicious": number | undefined,
        "suspicious": number | undefined,
        "timeout": number | undefined,
        "undetected": number | undefined,
    } | undefined,
    "reputation" : number | undefined,
    "tags" : Array<string> | undefined,
    "total_votes" : {
        "harmless" : number | undefined,
        "malicious": number | undefined,
    } | undefined,
    "whois" : string | undefined,
    "links.self" : string | undefined,
    "type" : string | undefined,
    "harmful" : string | boolean | undefined,
}

// TODO: Add Response type

export class APICalls {

    private cachedResultsIP: Map<string, string>;
    private cachedResultsURL: Map<string, string>;

    constructor() {
        this.cachedResultsIP = new Map();
        this.cachedResultsURL = new Map();
    }

    public getIPdata(ipaddress: string): string {
        let cacheHit = this.cachedResultsIP.get(ipaddress);
        if (cacheHit) {
            console.log("CACHE HIT");
            return cacheHit;
        }
        else {
            return "### IP Address";
        }
    }

    public getURLdata(url: string): string | undefined {
        let cacheHit = this.cachedResultsURL.get(url);
        if (cacheHit) {
            console.log("Cache Hit");
            return cacheHit;
        }
        else {
            let api_url = 'https://safebrowsing.googleapis.com/v4/threatMatches:find?key=' + APIKEYS.getGoogleKey();
            let params = {
                "threatInfo": {
                    "threatTypes": ["UNWANTED_SOFTWARE", "MALWARE", "THREAT_TYPE_UNSPECIFIED", "SOCIAL_ENGINEERING", "POTENTIALLY_HARMFUL_APPLICATION"],
                    "platformTypes": ["ANY_PLATFORM"],
                    "threatEntryTypes": ["URL"],
                    "threatEntries": [
                        { "url": url }
                    ]
                }
            }
            return axios.post(api_url, params).then(
                (resp: any) => {
                    let response = "URL Not found in Safe Browsing Database";
                    if (resp.data.matches) {
                        response = "### URL \n  #### JSON Payload \n\n " + JSON.stringify(resp.data.matches);
                    }
                    this.cachedResultsURL.set(url, response);
                    return response
                }
            )
        }
    }
}

export default APICalls;