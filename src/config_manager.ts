import * as vscode from 'vscode';
import { APIStrategy } from './api_strategy';
import { GetStrategy } from './get_strategy';
import { PostStrategy } from './post_strategy';
import VirusTotalStrategy from './virus_total_strategy';

/**
 * The config manager class manages
 * all access to and from the settings/configuration.
 * The configuration can be found in package.json.
 */
export class ConfigManager {
    // Singleton instance of the config manager
    private static myConfigManager: ConfigManager;
    private configuration: vscode.WorkspaceConfiguration;
    private onUpdates: Function[];

    private constructor() {
        this.configuration = vscode.workspace.getConfiguration('live-notebook');
        this.onUpdates = [];
        vscode.workspace.onDidChangeConfiguration(() => {
            this.configuration = vscode.workspace.getConfiguration('live-notebook');
            this.onUpdates.forEach(f => f());
        });
    }
    /**
     * @returns The singleton instance of ConfigManager
     */
    public static getConfigManager() {
        if (!ConfigManager.myConfigManager) ConfigManager.myConfigManager = new ConfigManager();
        return ConfigManager.myConfigManager;
    }

    /**
     * Access the config file in package.json
     * and load in the regular expressions.
     * @returns An array of TypedRegex
     */
    public getTypedRegexes() {
        // Access the configuration
        let regexArray: any = this.configuration.get('regexes');
        return regexArray;
    }

    public onDidUpdateConfiguration(onUpdate: (value: any) => unknown | undefined | void) {
        this.onUpdates.push(onUpdate);
    }

    /**
     * Access the config file in package.json
     * and load in the APIs as their respective calling
     * strategies/methods.
     * DOES NOT load sidebar strategies.
     * @returns An array of api strategies
     */
    public getAPIStrategies() {
        let rawApiArray: any = this.configuration.get('apis');
        let safeApiArray = this.sanitizeAPIs(rawApiArray);

        let strategies = new Array<APIStrategy>(0);
        // Convert safe config data into their strategies.
        for (let i = 0; i < safeApiArray.length; i++) {
            if(!safeApiArray[i].isSidePanelAPI || safeApiArray[i].isSidePanelAPI !== true) {
                let newStrategy = this.toStrategy(safeApiArray[i]);
                if (newStrategy !== undefined) {
                    strategies.push(<APIStrategy>newStrategy);
                }
            }
        }
        return strategies;
    }

    /**
     * @returns One sidepanel strategy if any side panel strategies exist in the config, may return undefined
     */
    public getSidePanelStrategy() {
        let rawApiArray: any = this.configuration.get('apis');
        let sidePanelAPIArray = new Array<any>(0);
        for (let i = 0; i < rawApiArray.length; i++) {
            if (rawApiArray[i].isSidePanelAPI && rawApiArray[i].isSidePanelAPI === true) {
                sidePanelAPIArray.push(rawApiArray[i]);
            }
        }
        let safeApiArray = this.sanitizeAPIs(sidePanelAPIArray);
        return this.toStrategy(safeApiArray[0]);
    }

    /**
     * Convert an API's JSON into an appropriate strategy for API call usage.
     * @param myAPI The api to be converted into a strategy.
     */
    public toStrategy (myAPI: any) : APIStrategy | undefined {
        if (!myAPI || !myAPI.method)
            return undefined;

        switch (myAPI.method) {
            case "POST":
                if (!myAPI.body) vscode.window.showWarningMessage("CONFIG WARNING: Body undefined for: " + myAPI.name + ", and it is using " +
                    "a POST request, so it may be missing information.");
                return new PostStrategy(myAPI);

            case "GET":
                if (myAPI.body) vscode.window.showWarningMessage("CONFIG WARNING: Body defined for: " + myAPI.name + ", however it is using " +
                    "a GET request, so this information will not be used.");
                return new GetStrategy(myAPI);

            case "VirusTotal":
                return new VirusTotalStrategy(myAPI);

            default:
                return undefined;
        }
    }

    /**
     * Return a sanitized list of usable APIs,
     * reject all APIs that do not define the required fields.
     * @param rawApiArray The unsanitized array of APIs
     */
    public sanitizeAPIs(rawApiArray: any) {
        if (!rawApiArray)
            return new Array<any>(0);

        // Access the configuration
        let safeApiArray = new Array<any>(0);

        // Check the raw config data for errors,
        // only add apis that appear to be configured correctly,
        // cannot account for all user error here, other checks must be done elsewhere.
        for (let i = 0; i < rawApiArray.length; i++) {
            // Boolean representing if an error has been found
            let safe = true;
            // A list of errors as strings
            let errors = [];
            let name = "UNNAMED API";
            
            if (!rawApiArray[i].name) {
                errors.push("| Must define a name field |");
                safe = false;
            } else {
                name = rawApiArray[i].name;
            }

            if (!rawApiArray[i].url) {
                errors.push("| Must define a url field |");
                safe = false;
            }

            if (!rawApiArray[i].method) {
                errors.push("| Must define a method field, ex: POST, GET |");
                safe = false;
            }

            if (!rawApiArray[i].type) {
                errors.push("| Must define a type field |");
                safe = false;
            }

            if (!rawApiArray[i].mapping) {
                errors.push("| Must define a mapping field |");
                safe = false;
            }

            if (safe) {
                // Push the API, it is safe to use.
                safeApiArray.push(rawApiArray[i]);
            } else {
                // Do not push the API, show the user the error(s).
                vscode.window.showErrorMessage(
                    "API CONFIG ERROR, " + name + ": " + errors.reduce((before,current,i) => 
                        i == 0 ? current : before + " , " + current)
                );
            }
        }
        return safeApiArray;
    }
}
export default ConfigManager;