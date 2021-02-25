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
    private strategies: APIStrategy[];

    // Strategy for the sidebar
    private sideBarStrategy: APIStrategy | undefined;

    constructor() {
        this.strategies = ConfigManager.getConfigManager().getAPIStrategies();
        ConfigManager.getConfigManager().onDidUpdateConfiguration(() => this.strategies = ConfigManager.getConfigManager().getAPIStrategies());

        this.sideBarStrategy = ConfigManager.getConfigManager().getSidePanelStrategy();
        ConfigManager.getConfigManager().onDidUpdateConfiguration(() => this.sideBarStrategy = ConfigManager.getConfigManager().getSidePanelStrategy());
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

    public getSideBarRawResponse(token: string): Promise<any>{
        if(this.sideBarStrategy !== undefined){
            return this.sideBarStrategy.getAPIRawResponse(token);
        }
        return Promise.resolve("{Undefined sidebar strategy}");
    }

    public async getSidePanelResponse(token: string): Promise<CommonDataModel> {
        let failureResponse: CommonDataModel = {
            api_name: "Side Panel API Undefined In Configuration",
            last_modification_date: undefined,
            last_analysis_stats: undefined,
            reputation: undefined,
            tags: undefined,
            total_votes: undefined,
            whois: "Side Panel API Undefined In Configuration",
            link_self: undefined,
            type: undefined,
            harmful: undefined
        }
        if (this.sideBarStrategy === undefined) {
            return failureResponse;
        }
        return await this.sideBarStrategy.getResponse(token);
    }
}

export default APICalls;
