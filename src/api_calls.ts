import { APIStrategy } from "./api_strategy";
import ConfigManager from "./config_manager";

const FormData = require('form-data');

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
    harmful?: string | boolean | JSON
}

export class APICalls {
    private cachedResults: Map<string, Promise<PromiseSettledResult<CommonDataModel>[]>>;
    private strategies: APIStrategy[];

    constructor() {
        this.cachedResults = new Map();
        this.strategies = ConfigManager.getConfigManager().getAPIStrategies();
        ConfigManager.getConfigManager().onDidUpdateConfiguration(() => this.strategies = ConfigManager.getConfigManager().getAPIStrategies());
    }

    /**
     * Filter through strategies to get apis
     * that can be called on the given type of token, and
     * will then return a promise array of Common Data Model responses.
     * @param type The type of token being passed, url, ip, etc...
     * @param token The token being sent to the APIs
     */
    public async getResponse(type: string, token: string): Promise<PromiseSettledResult<CommonDataModel>[]> {
        // Cache is managed entirely in the strategies themselves.
        return Promise.allSettled(this.strategies.filter((strategy) => strategy.getTokenTypes().includes(type))
            .map(async function (strategy) { return await strategy.getResponse(token); }));
    }
}

export default APICalls;
