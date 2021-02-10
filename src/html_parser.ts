import * as vscode from 'vscode';
import { APICalls, CommonDataModel } from "./api_calls";

export class HTMLParser{

    // apiCalls is the class that handles all calls to the configured APIs
    apiCalls: APICalls;

    constructor(apiCalls: APICalls){
        this.apiCalls = apiCalls;
    }

    /**
     * @param token The matched token to be sent in the API call
     * @returns An instance of the common data model, usually with the whois field filled with data.
     */
    public getSidePanelData(myWebView: vscode.WebviewPanel, token: string) {
        this.apiCalls.getSidePanelResponse(token).then( function(result)
            {myWebView.webview.html = HTMLParser.parseHTML(result)}
        );
    }

    static parseHTML(result: CommonDataModel){
        return JSON.stringify(result);
    }
}

export default HTMLParser;