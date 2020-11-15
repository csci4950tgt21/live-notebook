import APIKEYS from "./apiKEYS";

const axios = require('axios').default;

export type CommonDataModel = {
    last_modification_date?: number | string,
    last_analysis_stats?: {
        harmless?: number,
        malicious?: number,
        suspicious?: number,
        timeout?: number,
        undetected?: number,
    },
    reputation?: number,
    tags?: Array<string>,
    total_votes?: {
        harmless?: number,
        malicious?: number,
    },
    whois?: string,
    "links.self"?: string,
    type?: string,
    harmful?: string | boolean,
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