import iconv from "iconv-lite"
import cheerio from "cheerio"
import { CreeperOptions } from "../index";

export class DomParse {

    static parse(body: string,  options?: CreeperOptions): CheerioStatic {

        const $ = cheerio.load(iconv.decode(Buffer.from(body), this.encoding(options)))

        return $
    }

    private static encoding(options?: CreeperOptions): string {
        if (!options || !options.encoding) {
            return 'UTF-8';
        }

        return options.encoding;
    }
}