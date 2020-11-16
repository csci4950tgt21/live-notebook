import { APIStrategy } from "./api_strategy";
import axios from 'axios';
import ConfigManager from "./config_manager";
const FormData = require('form-data');

export default class VirusTotalStrategy extends APIStrategy {
    // constructor() {
    //     super({ name: "VirusTotal URL", type: ["URL"] });
    // }

    protected async getRawResponse(token: string): Promise<any> {
        let response = "";
        let api_url = "https://www.virustotal.com/api/v3/urls";
        var vt_key = ConfigManager.getConfigManager().getVirusTotalKey();
        if (vt_key == undefined) return Promise.reject("VirusTotal API Key Undefined");
        let post_resp = {
            data: {
                id: -1,
            },
        };
        var formData = new FormData();
        formData.append("url", token);
        let virus_total_header = {
            headers: {
                ...formData.getHeaders(),
                "x-apikey": vt_key, //the token is a variable which holds the token
            },
        };
        let resolve = async (resp: any) => {
            post_resp.data = resp.data.data;
            let url_id = post_resp.data.id;
            console.log(url_id);
            if (url_id != undefined) {
                let new_api_url =
                    "https://www.virustotal.com/api/v3/analyses/" + url_id;
                let resolve = (resp: any) => {
                    // if (resp.data.data.attributes.status === "completed") {
                    //     let stats = resp.data.data.attributes.stats;
                    //     response =
                    //         "### URL \n  #### JSON Payload \n\n " +
                    //         JSON.stringify(stats);
                    // }
                    return resp.data;
                };
                return await axios
                    .get(new_api_url, virus_total_header)
                    .then(resolve);
            } else {
                return undefined;
            }
        }
        return axios
            .post(api_url, formData, virus_total_header).then(resolve, (err: any) => {
                console.error(err);
                return err.message;
            });
    }
}