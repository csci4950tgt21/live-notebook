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
        this.apiCalls.getSideBarRawResponse(token).then( 
            function(result)
            {
                myWebView.webview.html = HTMLParser.parseHTML(result, token)
            });
    }

    static parseHTML(result: any, url: string){
        console.log(result);
        let finalHTMLstring = "<html>";
        finalHTMLstring += "<h2> WHOIS Data: " + url + "</h2>";
        finalHTMLstring += "<table style=\"width:100%\">";
        finalHTMLstring += "<tr>";
        finalHTMLstring += "    <th> Key </th>";
        finalHTMLstring += "    <th> Value </th>";
        finalHTMLstring += "</tr>";

        for (let key in result.WhoisRecord) {
            if ((key !== "registrant") && (key !== "audit") && (key !== "rawText") && (key !== "strippedText")){
                finalHTMLstring += "<tr>";
                finalHTMLstring += "<td>" + key +"</td>";
                finalHTMLstring += "<td>" + result.WhoisRecord[key] +"</td>";
                finalHTMLstring += "</tr>";
            }
        }

        for (let key in result.WhoisRecord.registrant) {
            if (key != "rawText"){
                finalHTMLstring += "<tr>";
                finalHTMLstring += "<td>" + key +"</td>";
                finalHTMLstring += "<td>" + result.WhoisRecord.registrant[key] +"</td>";
                finalHTMLstring += "</tr>";
            }
        }
        for (let key in result.WhoisRecord.audit) {
            if (key != "rawText"){
                finalHTMLstring += "<tr>";
                finalHTMLstring += "<td>" + key +"</td>";
                finalHTMLstring += "<td>" + result.WhoisRecord.audit[key] +"</td>";
                finalHTMLstring += "</tr>";
            }
        }
        finalHTMLstring += "</table>"
        finalHTMLstring += "</html>"
        return finalHTMLstring;
    }
}

export default HTMLParser;