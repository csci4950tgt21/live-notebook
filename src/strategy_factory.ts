import { APIStrategy } from "./api_strategy";
import ConfigManager from "./config_manager";
import { GetStrategy } from './get_strategy';
import { PostStrategy } from './post_strategy';
import VirusTotalStrategy from './virus_total_strategy';
import * as vscode from 'vscode';

/**
 * The Strategy Factor class creates strategies from
 * an array of api json, obtained from the passed in configuration manager.
 */
export class StrategyFactory {
    // The array of json entries for APIs.
    private apiArray : Array<any> = [];

    // The sidebar API json entries
    private sideBarArray : Array<any> = [];

    // The static counter for API IDs, used in caching.
    private static apiCounter = 0;

    constructor(configManager : ConfigManager){
        // Set the API data according to the config
        this.setApiArray(configManager.getAPIData());
        this.setSideBarArray(configManager.getSidePanelData());

        // Have the config reset the API data when it is changed
        configManager.onDidUpdateConfiguration(() => {this.setApiArray(configManager.getAPIData())});

        // Have the config reset the API data when it is changed
        configManager.onDidUpdateConfiguration(() => {this.setSideBarArray(configManager.getSidePanelData())});

        // Reset the API counter so newly manufactured APIs have the correct ID
        configManager.onDidUpdateConfiguration(() => {StrategyFactory.resetAPICounter();});
    }

    private setApiArray(apiArray : Array<any>){
        this.apiArray = apiArray;
    }

    private setSideBarArray(sideBarArray : Array<any>){
        this.sideBarArray = sideBarArray;
    }

    /**
     * Reset the API counter to zero.
     */
    private static resetAPICounter(){
        this.apiCounter = 0;
    }

    /**
     * @returns The next unique ID for an API.
     */
    private static getNextApiID(){
        return this.apiCounter++;
    }

    /**
     * @returns An array of strategies manufactured from the array of config apis, or an empty list if not set.
     */
    public manufactureStrategyArray() : Array<APIStrategy> {
        let strategies = new Array<APIStrategy>(0);
        // Convert safe config data into their strategies.
        for (let i = 0; i < this.apiArray.length; i++) {
            if(!this.apiArray[i].isSidePanelAPI || this.apiArray[i].isSidePanelAPI !== true) {
                let newStrategy = this.toStrategy(this.apiArray[i]);
                if (newStrategy !== undefined) {
                    strategies.push(<APIStrategy>newStrategy);
                }
            }
        }
        return strategies;
    }

    /**
     * @returns The first side panel API in the json converted to a strategy, or undefined if there are none.
     */
    public manufactureSidePanelStrategy() : APIStrategy | undefined {
        // To Strategy is safe to call on empty lists
        return this.toStrategy(this.sideBarArray[0]);
    }

    /**
     * Convert an API's JSON into an appropriate strategy for API call usage.
     * @param myAPI The api json to be converted into a strategy.
     */
    private toStrategy (myAPI: any) : APIStrategy | undefined {
        if (!myAPI || !myAPI.method)
            return undefined;

        switch (myAPI.method) {
            case "POST":
                if (!myAPI.body) vscode.window.showWarningMessage("CONFIG WARNING: Body undefined for: " + myAPI.name + ", and it is using " +
                    "a POST request, so it may be missing information.");
                return new PostStrategy(myAPI, StrategyFactory.getNextApiID());

            case "GET":
                if (myAPI.body) vscode.window.showWarningMessage("CONFIG WARNING: Body defined for: " + myAPI.name + ", however it is using " +
                    "a GET request, so this information will not be used.");
                return new GetStrategy(myAPI, StrategyFactory.getNextApiID());

            case "VirusTotal":
                return new VirusTotalStrategy(myAPI, StrategyFactory.getNextApiID());

            default:
                return undefined;
        }
    }
}