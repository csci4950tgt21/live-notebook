import APIKEYS from "./apiKEYS";
import { APIStrategy } from "./api_strategy";
import ConfigManager from "./config_manager";
import VirusTotalStrategy from "./virus_total_strategy";

const axios = require('axios').default;

export type CommonDataModel = {
    api_name: string,
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
    link_self?: string,
    type?: string,
    harmful?: string | boolean,
}

export type Response = {
    status: number,
    data: CommonDataModel
}

export class APICalls {
    private cachedResults: Map<string, CommonDataModel[]>;
    private strategies: APIStrategy[];

    constructor() {
        this.cachedResults = new Map();
        this.strategies = ConfigManager.getConfigManager().getAPIStrategies();
    }

    /**
     * getReponse will first check cache for tokens already identified,
     * if cache hits exist it will return them without calling apis,
     * otherwise it will then filter through strategies to get apis
     * that can be called on the given type of token, and
     * will then return a promise array of Common Data Model responses.
     * @param type The type of token being passed, url, ip, etc...
     * @param token The token being sent to the APIs
     */
    public async getResponse(type: string, token: string): Promise<CommonDataModel[]> {
        var cached: CommonDataModel[] | undefined = this.cachedResults.get(token);
        if (cached !== undefined) return Promise.resolve(cached!);
        return Promise.all(this.strategies.filter((strategy) => type in strategy.getTokenTypes())
            .map(async function (strategy) { return await strategy.getResponse(token); }));
    }
}

export default APICalls;