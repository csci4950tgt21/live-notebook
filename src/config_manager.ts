import * as vscode from 'vscode';

/**
 * The config manager class manages
 * all access to and from the settings/configuration.
 * The configuration can be found in package.json.
 */
export class ConfigManager {
    // The name of the configuration section, allows us to reacquire the
    // configuration when it is updated by the user
    private configName : string;

    // The vscode loaded configuration
    private configuration: vscode.WorkspaceConfiguration;

    // The list of functions to be called when the configuration manager updates
    private onUpdates: Function[];

    constructor(configuration: vscode.WorkspaceConfiguration, configName : string = 'live-notebook') {
        // Set the vscode configuration
        this.configuration = configuration;

        if (!configuration)
        {
            throw new Error("ConfigManager was fed a null vscode configuration!");
        }

        // Set the configuration name, for updating purposes
        this.configName = configName;

        if (!configName)
        {
            configName = 'live-notebook';
        }

        // Set up list for automatic configuration updates
        this.onUpdates = [];

        // Reload the configuration when it changes, and run updates for subscribed classes
        vscode.workspace.onDidChangeConfiguration(() => {
            this.configuration = vscode.workspace.getConfiguration(this.configName);
            this.onUpdates.forEach(f => f());
        });
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
    public getAPIData() {
        let rawApiArray: any = this.configuration.get('apis');

        // Check that rawApiArray exists
        if (!rawApiArray) {
            throw new Error("WARNING, apis field does not exist in configuration!");
        }

        let safeApiArray = this.sanitizeAPIs(rawApiArray);

        return safeApiArray;
    }

    /**
     * @returns A list of side panel APIs if they exist in the configuration, may return undefined
     */
    public getSidePanelData() : any | undefined{
        let rawApiArray: any = this.configuration.get('apis');

        // Check that rawApiArray exists
        if (!rawApiArray) {
            throw new Error("WARNING, apis field does not exist in configuration!");
        }

        let sidePanelAPIArray = new Array<any>(0);
        for (let i = 0; i < rawApiArray.length; i++) {
            if (rawApiArray[i].isSidePanelAPI && rawApiArray[i].isSidePanelAPI === true) {
                sidePanelAPIArray.push(rawApiArray[i]);
            }
        }
        let safeApiArray = this.sanitizeAPIs(sidePanelAPIArray);

        return safeApiArray;
    }

    /**
     * Return a sanitized list of usable APIs,
     * reject all APIs that do not define the required fields.
     * @param rawApiArray The unsanitized array of APIs
     */
    private sanitizeAPIs(rawApiArray: any) {
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

            if (!rawApiArray[i].mapping && !(rawApiArray[i].isSidePanelAPI && rawApiArray[i].isSidePanelAPI === true)) {
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