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

    public getURLdata(url: string) : string {
        let cacheHit = this.cachedResultsURL.get(url) ?? "undefined";
        if (cacheHit == "undefined"){
            return "API IP CALL";
        }
        else{
            console.log("CACHE HIT");
            return cacheHit;
        }
    }
}

export default APICalls;