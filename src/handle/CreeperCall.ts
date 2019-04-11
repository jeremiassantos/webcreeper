import requestP from "request-promise"
import iconv from "iconv-lite"
import cheerio from "cheerio"

export class CreeperCall {

    static async getPage(pageUrl: string) {

        return await requestP({
            uri: pageUrl,
            encoding: null,
            transform: function (body) {
                return cheerio.load(iconv.decode(Buffer.from(body), "ISO-8859-1"));
            }
        }).then(($) => {
            return $;
        })
    }
}