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
     * @returns An array of API strategies
     */
    public getAPIStrategies() {
        // Access the configuration
        let rawApiArray: any = this.configuration.get('apis');
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

        let strategies = new Array<APIStrategy>(0);
        // Convert safe config data into their strategies.
        for (let i = 0; i < safeApiArray.length; i++) {
            switch (safeApiArray[i].method) {
                case "POST":

                    if (!safeApiArray[i].body) vscode.window.showWarningMessage("CONFIG WARNING: Body undefined for: " + safeApiArray[i].name + ", and it is using " +
                        "a POST request, so it may be missing information.");
                    strategies.push(new PostStrategy(safeApiArray[i]));

                    break;
                case "GET":

                    if (safeApiArray[i].body) vscode.window.showWarningMessage("CONFIG WARNING: Body defined for: " + safeApiArray[i].name + ", however it is using " +
                        "a GET request, so this information will not be used.");
                    strategies.push(new GetStrategy(safeApiArray[i]));

                    break;
                case "VirusTotal":

                    strategies.push(new VirusTotalStrategy(safeApiArray[i]));

                    break;
            }
        }
        return strategies;
    }
}
export default ConfigManager;