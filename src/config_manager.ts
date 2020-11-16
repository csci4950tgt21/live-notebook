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

    /**
     * @returns The singleton instance of ConfigManager
     */
    public static getConfigManager() {
        if (!ConfigManager.myConfigManager) ConfigManager.myConfigManager = new ConfigManager();
        return ConfigManager.myConfigManager;
    }

    public getVirusTotalKey() {
        return vscode.workspace.getConfiguration('live-notebook').get('virustotal_api_key');
    }

    /**
     * Access the config file in package.json
     * and load in the regular expressions.
     * @returns An array of TypedRegex
     */
    public getTypedRegexes() {
        // Access the configuration
        let regexArray: any = vscode.workspace.getConfiguration('live-notebook').get('regexes');
        return regexArray;
    }

    /**
     * Access the config file in package.json
     * and load in the APIs as their respective calling
     * strategies/methods.
     * @returns An array of API strategies
     */
    public getAPIStrategies() {
        // Access the configuration
        let apiArray: any = vscode.workspace.getConfiguration('live-notebook').get('apis');

        // Create a new array of api strategies
        let strategies = new Array<APIStrategy>(apiArray.length);
        for (let i = 0; i < strategies.length; i++) {
            switch (apiArray[i].method) {
                case "POST":
                    strategies[i] = new PostStrategy(apiArray[i]);
                    break;
                case "GET":
                    strategies[i] = new GetStrategy(apiArray[i]);
                    break;
                case "VirusTotal":
                    strategies[i] = new VirusTotalStrategy(apiArray[i]);
                    break;
            }
        }
        return strategies;
    }
}
export default ConfigManager;