import { config } from 'process';
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
        let apiArray: any = this.configuration.get('apis');

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