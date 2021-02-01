import * as vscode from 'vscode';
import {HTMLParser} from './html_parser';

export class SidePanels {
    sidePanels: any;
    HTMLParser: any;

    constructor() {
        this.sidePanels = new Map<string, vscode.WebviewPanel>();
        this.HTMLParser = new HTMLParser();
    }

    getHTML(stringOfInterest: string, apiResponse: Promise<any> ){
        return apiResponse.then((value) => { 
            return "<h1> The URL is "+stringOfInterest + " </h1> <br> <br> "+ value;
        });
    };

    addSidePanel(stringOfInterest: string, apiResponse:  Promise<any>){
        var sidePaneltemp = vscode.window.createWebviewPanel(stringOfInterest, stringOfInterest, vscode.ViewColumn.Two, {});
        sidePaneltemp.webview.html=this.HTMLParser.getHTML(stringOfInterest, apiResponse);
        sidePaneltemp.onDidDispose(()=>{this.sidePanels.delete(stringOfInterest)}, null);
        this.sidePanels.set(stringOfInterest, sidePaneltemp);
    };

    onHoverFocus(stringOfInterest: string, apiResponse: Promise<any>){
        var sidePaneltemp = this.sidePanels.get(stringOfInterest);
        if (sidePaneltemp){
            this.getHTML(stringOfInterest, apiResponse).then((value)=> {sidePaneltemp.webview.html = value});
            sidePaneltemp.reveal();
        }
        else{
            this.addSidePanel(stringOfInterest, apiResponse); // Incase Deleted
        }
    }
}

export default SidePanels;
