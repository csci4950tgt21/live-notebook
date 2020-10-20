import { Hash } from 'crypto';
import * as vscode from 'vscode';
const axios = require('axios').default;

export class APICalls {
    
    private cachedResultsIP: Map<string, string>;
    private cachedResultsURL: Map<string, string>;

    constructor() {
        this.cachedResultsIP = new Map();
        this.cachedResultsURL = new Map();
    }

    public getIPdata(ipaddress: string) : string {
        let cacheHit = this.cachedResultsIP.get(ipaddress) ?? "undefined";
        if (cacheHit == "undefined"){
            return "API IP CALL";
        }
        else{
            console.log("CACHE HIT");
            return cacheHit;
        }
    }

    public getURLdata(url: string) : string | undefined {
        let cacheHit = this.cachedResultsURL.get(url) ?? "undefined";
        if (cacheHit == "undefined"){
            let api_url = 'https://safebrowsing.googleapis.com/v4/threatMatches:find?key=' + 'AIzaSyBRDZ9lG8dZog5Jg5RvpeoSJMtq5pyaD-4';
            let params = {
                "threatInfo": {
                    "threatTypes":      ["UNWANTED_SOFTWARE", "MALWARE","THREAT_TYPE_UNSPECIFIED","SOCIAL_ENGINEERING","POTENTIALLY_HARMFUL_APPLICATION"],
                    "platformTypes":    ["ANY_PLATFORM"],
                    "threatEntryTypes": ["URL"],
                    "threatEntries": [
                        {"url": url}
                    ]
                }
            }
            return axios.post(api_url,params).then(
                (resp: any) => {
                if(resp.data.matches){
                    return JSON.stringify(resp.data.matches);
                }
                return "URL Not found in Database"
                }
            )
        }
        else{
            console.log("CACHE HIT");
            return cacheHit;
        }
    }
}

export default APICalls;