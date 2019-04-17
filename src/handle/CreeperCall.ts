import { CreeperOptions } from "../index";
import { CreeperState } from "../core/CreeperState";
import request from "request";
import { DomParse } from "../core/DomParse";
import fs from "fs"

export class CreeperCall {

    private static state: CreeperState = new CreeperState();

    static async getPage(pageUrl: string, options?: CreeperOptions) {
        return await this.execuete(pageUrl, options).catch((err) => new Error(err))
    }

    private static async execuete(pageUrl: string, options?: CreeperOptions): Promise<any> {
        return new Promise<any>((resolve, reject) => {

            request({
                method: this.method(options),
                headers: this.headers(options),
                url: pageUrl,
                encoding: null,
                qs: this.queryParams(options),
                json: this.json(options),
                jar: this.state.getCookie(),
                form: this.formData(options),
                rejectUnauthorized: false
            }, async (err, res, body) => {

                console.log(` [ Response status code: ${res.statusCode} ]`)

                if (err || res.statusCode > 399) {
                    if (options && options.printFileWhenError) {
                        await this.createFileError(res.body)
                    }
                    throw new Error(`Error in the request: status ${res.statusCode}`)
                }

                if (options && options.sessions) {
                    this.state.setCookie(res, options.sessions)
                } else {
                    this.state.setCookie(res)
                }

                if (this.json(options)) {
                    resolve({
                        dom: '',
                        body: body
                    })
                } else {

                    resolve({
                        dom: DomParse.parse(body, options),
                        body: body
                    })
                }

            })
        })
    }

    private static method(options?: CreeperOptions): string {
        if (!options || !options.httpMethod) {
            return "GET"
        }
        return options.httpMethod;
    }

    private static queryParams(options?: CreeperOptions): object {
        if (!options || !options.queryParams) {
            return null
        }

        const qs = {}

        for (let key of options.queryParams.keys()) {
            qs[key] = options.queryParams.get(key);
        }

        return qs;
    }

    private static headers(options?: CreeperOptions): object {

        const headers = {}

        if (options && options.headers) {
            for (let key of options.headers.keys()) {
                headers[key] = options.headers.get(key);
            }
        }

        if (options && options.json) {
            headers['Content-Type'] = 'application/json; charset=UTF-8'
        }

        if (options && options.formData) {
            headers['Content-Type'] = 'application/x-www-form-urlencoded'
        }

        if (options && options.setCookieHeader) {
            headers['cookie'] = this.buildCookiesHeader()
        }

        return headers;
    }

    private static json(options?: CreeperOptions): object {
        if (!options || !options.json) {
            return null
        }

        return options.json;
    }

    private static formData(options?: CreeperOptions): object {
        if (!options || !options.formData) {
            return null
        }

        const form = {};

        for (let key of options.formData.keys()) {
            form[key] = options.formData.get(key);
        }

        return form;
    }

    static buildCookiesHeader() {

        const cookiesList = JSON.parse(JSON.stringify(CreeperCall.getCreeperState().getCookie()))['_jar'].cookies

        let builder = '';

        for (var i = 0; i < cookiesList.length; i++) {
            const { key, value } = cookiesList[i]
            builder += `${key}=${value};`
        }

        return builder
    }

    static getCreeperState(): CreeperState {
        return this.state;
    }

    static async createFileError(body: string): Promise<void> {
        const finalName = `ERROR-${new Date().getTime()}.html`
        await fs.writeFile(finalName, body, function (err) {
            if (err) {
                return console.log(err);
            }
            console.log(` [ The ${finalName} file error was saved! ]`);
        })
    }
}