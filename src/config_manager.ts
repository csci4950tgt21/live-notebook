import * as vscode from 'vscode';

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
        return regexArray;
    }

    // TODO: API config accessing code
}
export default ConfigManager;