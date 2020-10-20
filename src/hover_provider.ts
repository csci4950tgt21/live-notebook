import * as vscode from 'vscode';
import { RegexManager } from "./regex_manager";
import { APICalls } from "./api_calls";

class NotebookHoverProvider implements vscode.HoverProvider {
    regexManager: RegexManager;
    apiCalls: APICalls;

    constructor(regexManager: RegexManager, apiCalls: APICalls) {
        this.regexManager = regexManager;
        this.apiCalls = apiCalls;
    }

    provideHover(doc: vscode.TextDocument, pos: vscode.Position, tok: vscode.CancellationToken) : vscode.ProviderResult<vscode.Hover> {
        
        var matchRange: vscode.Range | undefined = doc.getWordRangeAtPosition(pos, /\S+/); 
        // Does not match spaces in the middle of tokens
        
        if (matchRange !== undefined) {
            var stringOfInterest: string = doc.getText(matchRange);
            var getResult: Promise<string> = new Promise((resolve, _) => {
                var type: string | undefined = this.regexManager.matchToken(stringOfInterest);
                
                console.log(type + " " + stringOfInterest);
                var response = "Type: " + type;

                if (type == "URL"){
                    response = this.apiCalls.getURLdata(stringOfInterest) ?? "undefined";
                }

                if (type == "IP"){
                    response = this.apiCalls.getIPdata(stringOfInterest);
                }

                resolve(response);
            });
            return getResult.then(result => new vscode.Hover(new vscode.MarkdownString(result)));
        }
        return null;
    }
}

export default NotebookHoverProvider;