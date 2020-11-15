import * as vscode from 'vscode';
import { APIStrategy } from './api_strategy';
import { GetStrategy } from './get_strategy';
import { PostStrategy } from './post_strategy';

/**
 * The TypedRegex type holds both a regular expression, and the type
 * of the regular expression, such as "URL" or "EMAIL".
 */
export type TypedRegex = {
    type: string;
    regex: RegExp;
};

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
    public static getConfigManager () {
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
        let regexArray : any = vscode.workspace.getConfiguration('live-notebook').get('regexes');

        // Create a new array of typed regular expressions,
        // and assign them to the configuration values
        let regexes = new Array<TypedRegex>(regexArray.length);
        for (let i = 0; i < regexArray.length; i++) {
            regexes[i] = {type: regexArray[i].type, regex: regexArray[i].regex};
        }
        return regexes;
    }

    /**
     * Access the config file in package.json
     * and load in the APIs as their respective calling
     * strategies/methods.
     * @returns An array of API strategies
     */
    public getAPIStrategies() {
        // Access the configuration
        let apiArray : any = vscode.workspace.getConfiguration('live-notebook').get('apis');

        // Create a new array of api strategies
        let strategies = new Array<APIStrategy>(apiArray.lenth);
        for (let i = 0; i < strategies.length; i++) {
            switch (apiArray[i].method) {
                case "POST":
                    strategies[i] = new PostStrategy(apiArray[i]);
                    break;
                case "GET":
                    strategies[i] = new GetStrategy(apiArray[i]);
                    break;
            }
        }
        return strategies;
    }
}
export default ConfigManager;