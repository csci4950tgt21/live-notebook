import * as vscode from 'vscode';
import { RegexManager } from "./regex_manager";

class NotebookHoverProvider implements vscode.HoverProvider {
    regexManager: RegexManager;

    constructor(regexManager: RegexManager) {
        this.regexManager = regexManager;
    }

    provideHover(doc: vscode.TextDocument, pos: vscode.Position, tok: vscode.CancellationToken)
        : vscode.ProviderResult<vscode.Hover> {
        var matchRange: vscode.Range | undefined =
            doc.getWordRangeAtPosition(pos, /\S+/); // Does not match spaces in the middle of tokens
        if (matchRange !== undefined) {
            var stringOfInterest: string = doc.getText(matchRange);
            var getResult: Promise<string> = new Promise((resolve, _) => {
                var type: string | undefined = this.regexManager.matchToken(stringOfInterest);
                console.log(type);
                // API Calls & Parsing Here
                resolve(type);
            });
            return getResult.then(result => new vscode.Hover(new vscode.MarkdownString(result)));
        }
        return null;
    }
}

export default NotebookHoverProvider;