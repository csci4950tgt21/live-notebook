import * as vscode from 'vscode';
import APICalls from './api_calls';
import {HTMLParser} from './html_parser';

export class SidePanels {
    sidePanels: any;
    HTMLParser: any;

    constructor(apiCalls : APICalls) {
        this.sidePanels = new Map<string, vscode.WebviewPanel>();
        this.HTMLParser = new HTMLParser(apiCalls);
    }

    addSidePanel(stringOfInterest: string){
        var sidePaneltemp = vscode.window.createWebviewPanel(stringOfInterest, stringOfInterest, vscode.ViewColumn.Two, {});

        // Get Side panel data contains a callback that will set the webview sidePaneltemp's html to the ansynchronous api response
        this.HTMLParser.getSidePanelData(sidePaneltemp, stringOfInterest);

        sidePaneltemp.onDidDispose(()=>{this.sidePanels.delete(stringOfInterest)}, null);
        this.sidePanels.set(stringOfInterest, sidePaneltemp);
    };

    onHoverFocus(stringOfInterest: string){
        var sidePaneltemp = this.sidePanels.get(stringOfInterest);
        if (sidePaneltemp){
            // Get Side panel data contains a callback that will set the webview sidePaneltemp's html to the ansynchronous api response
            this.HTMLParser.getSidePanelData(sidePaneltemp, stringOfInterest);
            
            sidePaneltemp.reveal();
        }
        else{
            this.addSidePanel(stringOfInterest); // Incase Deleted
        }
    }
}

export default SidePanels;
