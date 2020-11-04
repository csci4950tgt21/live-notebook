import APIKEYS from "./apiKEYS";

const axios = require("axios").default;
const FormData = require('form-data');

export class APICalls {
  private cachedResultsIP: Map<string, string>;
  private cachedResultsURL: Map<string, string>;

  constructor() {
    this.cachedResultsIP = new Map();
    this.cachedResultsURL = new Map();
  }

  public getIPdata(ipaddress: string): string {
    let cacheHit = this.cachedResultsIP.get(ipaddress);
    if (cacheHit) {
      console.log("CACHE HIT");
      return cacheHit;
    } else {
      return "### IP Address";
    }
  }

  public getURLdata(url: string): string | undefined {
    let response = "";
    let cacheHit = this.cachedResultsURL.get(url);
    if (cacheHit) {
      console.log("Cache Hit");
      return cacheHit;
    } else {
      let api_url = "https://www.virustotal.com/api/v3/urls";
      let params = {
        url: url,
      };
      var vt_key = APIKEYS.getVirusTotalKey();
      var virus_total_header = {
        headers: {
          "x-apikey": vt_key, //the token is a variable which holds the token
          'Content-Type': 'multipart/form-data'
        },
      };
      let post_resp = {
        data: {
          id: -1,
        },
      };
      const formData = new FormData();
        formData.append("url", "www.google.com");
      return axios
        .post(api_url, formData,virus_total_header)
        .then((resp: any) => {
            console.log(resp)
          post_resp.data = resp.data;
          let url_id = post_resp.data.id;
          console.log(url_id);
          return "TEST";
        //   if (url_id != -1) {
        //     let new_api_url =
        //       "https://www.virustotal.com/api/v3/analyses/" + url_id;
        //     return axios
        //       .get(new_api_url, virus_total_header)
        //       .then((resp: any) => {
        //         if (resp.data.attributes.status === "completed") {
        //           let stats = resp.data.attributes.stats;
        //           response =
        //             "### URL \n  #### JSON Payload \n\n " +
        //             JSON.stringify(stats);
        //         }
        //         this.cachedResultsURL.set(url, response);
        //         return response;
        //       });
        //   } else {
        //     return "### URL NOT FOUND";
        //   }
        }).then(undefined, (err: any) => {
            console.error('I am error');
            console.log(err)
         })
    }
  }
}

export default APICalls;
