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
    // The list of strategies to use
    private strategies: APIStrategy[];

    // Strategy for the sidebar
    private sideBarStrategy: APIStrategy | undefined;

    // The configuration manager to load api strategies from
    private configManager : ConfigManager;

    constructor(configManager : ConfigManager) {
        this.configManager = configManager;

        if (!configManager)
        {
            throw new Error("APICalls was fed a null configuration manager!");
        }

        // Reset the API counter for api_strategy, TODO: create API factory class, and manage ids there instead of here
        // Reset the API Counter on configuration update
        this.configManager.onDidUpdateConfiguration(() => APIStrategy.resetAPICounter);

        // Clear the API strategy cache, also too tightly coupled, TODO: find a fix
        this.configManager.onDidUpdateConfiguration(() => APIStrategy.clearAPICache);

        // Load the strategies, and set them so they are reloaded when the configuration changes
        this.strategies = this.configManager.getAPIStrategies();
        this.configManager.onDidUpdateConfiguration(() => this.strategies = this.configManager.getAPIStrategies());

        // Load the sidebarstrategy, and set it so it reloades when the configuration changes
        this.sideBarStrategy = this.configManager.getSidePanelStrategy();
        this.configManager.onDidUpdateConfiguration(() => this.sideBarStrategy = this.configManager.getSidePanelStrategy());
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
