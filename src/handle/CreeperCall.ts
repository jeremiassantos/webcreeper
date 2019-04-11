import requestP from "request-promise"
import iconv from "iconv-lite"
import cheerio from "cheerio"
import { CreeperOptions } from "../core/Creeper";

export class CreeperCall {

    static async getPage(pageUrl: string, options?: CreeperOptions) {

        return await requestP({
            method: this.method(options),
            uri: pageUrl,
            encoding: null,
            qs: this.queryParams(options),
            transform: function (body) {
                return cheerio.load(iconv.decode(Buffer.from(body), "ISO-8859-1"));
            }
        }).then(($) => {
            return $;
        })
    }

    private static method(options?: CreeperOptions): string {
        if(!options || !options.httpMethod) {
            return "GET"
        }
        return options.httpMethod;
    }

    private static queryParams(options?: CreeperOptions): object {
        if(!options || !options.queryParams) {
            return null
        }

        const qs = {}

        for(let key of options.queryParams.keys()) { 
            qs[key] = options.queryParams.get(key);
        }
        
        return qs;
    }
}