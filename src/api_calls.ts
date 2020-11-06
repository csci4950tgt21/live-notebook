import APIKEYS from "./apiKEYS";
import axios from 'axios';

const FormData = require('form-data');

type response = {
  status: number,
  body: {
    type: string,
    string: string,
  }
}

export class APICalls {
  private cachedResultsIP: Map<string, string>;
  private cachedResultsURL: Map<string, string>;

  constructor() {
    this.cachedResultsIP = new Map();
    this.cachedResultsURL = new Map();
  }

  public getIPdata(ipaddress: string): Promise<any> {
    let cacheHit = this.cachedResultsIP.get(ipaddress);
    if (cacheHit) {
      console.log("CACHE HIT");
      return new Promise((resolve, _) => {
        resolve(cacheHit);
      });
    } else {
      return new Promise((resolve, _) => {
        resolve("### IP Address");
      });;
    }
  }



  public async getURLdata(url: string): Promise<any> {
    let response = "";
    let cacheHit = this.cachedResultsURL.get(url);
    if (cacheHit) {
      console.log("Cache Hit");
      return cacheHit;
    } else {
      let api_url = "https://www.virustotal.com/api/v3/urls";
      var vt_key = APIKEYS.getVirusTotalKey();
      let post_resp = {
        data: {
          id: -1,
        },
      };
      var formData = new FormData();
      formData.append("url", url);
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
            if (resp.data.data.attributes.status === "completed") {
              let stats = resp.data.data.attributes.stats;
              response =
                "### URL \n  #### JSON Payload \n\n " +
                JSON.stringify(stats);
            }
            this.cachedResultsURL.set(url, response);
            return response;
          };
          return await axios
            .get(new_api_url, virus_total_header)
            .then(resolve);
        } else {
          return "### URL NOT FOUND";
        }
      }
      return await axios
        .post(api_url, formData, virus_total_header).then(resolve, (err: any) => {
          console.error(err);
          return err.message;
        });
    }
  }
}

export default APICalls;
