import { APIStrategy } from "./api_strategy";
import { Cache } from "./cache";
import ConfigManager from "./config_manager";
import { MapCache } from "./map_cache";
import { StrategyFactory } from "./strategy_factory";

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

    // The configuration manager to add call backs to when the config changes
    private configManager : ConfigManager;

    // The strategy factory to load strategies from
    private strategyFactory : StrategyFactory;

    // The cache for strategies to use
    private apiCache: Cache<any>;

    constructor(configManager : ConfigManager) {
        this.configManager = configManager;

        if (!configManager)
        {
            throw new Error("APICalls was fed a null configuration manager!");
        }

        // Create a new strategy factory with the config
        // MUST BE DONE BEFORE ADDING METHODS TO onDidUpdateConfiguration
        this.strategyFactory = new StrategyFactory(configManager);

        // Create a new Cache to be used by strategy calls
        this.apiCache = new MapCache();

        // Reset the centralized cache when the configuration updates.
        this.configManager.onDidUpdateConfiguration(() => {this.apiCache.clearCache()});

        // Load the strategies, and set them so they are reloaded when the configuration changes.
        this.strategies = this.strategyFactory.manufactureStrategyArray();
        this.configManager.onDidUpdateConfiguration(() => this.strategies = this.strategyFactory.manufactureStrategyArray());

        // Load the sidebarstrategy, and set it so it reloades when the configuration changes.
        this.sideBarStrategy = this.strategyFactory.manufactureSidePanelStrategy();
        this.configManager.onDidUpdateConfiguration(() => this.sideBarStrategy = this.strategyFactory.manufactureSidePanelStrategy());
    }

    /**
     * Filter through strategies to get apis
     * that can be called on the given type of token, and
     * will then return a promise array of Common Data Model responses.
     * @param type The type of token being passed, url, ip, etc...
     * @param token The token being sent to the APIs
     */
    public async getResponse(type: string, token: string): Promise<PromiseSettledResult<CommonDataModel>[]> {
        let myCache : Cache<any> = this.apiCache;
        // Cache is managed entirely in the strategies themselves.
        return Promise.allSettled(this.strategies.filter((strategy) => strategy.getTokenTypes().includes(type))
            .map(async function (strategy) { return await strategy.getResponse(token, myCache); }));
    }

    public getSideBarRawResponse(token: string): Promise<any>{
        if(this.sideBarStrategy !== undefined){
            return this.sideBarStrategy.getAPIRawResponse(token, this.apiCache);
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
        return await this.sideBarStrategy.getResponse(token, this.apiCache);
    }
}

export default APICalls;
