import { CreeperOptions } from "../index";
import { CreeperState } from "../core/CreeperState";
import request from "request";
import { DomParse } from "../core/DomParse";
import * as fs from "fs"

export class CreeperCall {

    private static state: CreeperState = new CreeperState();

    static async getPage(pageUrl: string, options?: CreeperOptions) {
        return await this.execute(pageUrl, options)
    }

    private static async execute(pageUrl: string, options?: CreeperOptions): Promise<any> {
        return new Promise<any>((resolve) => {

            try {
                request({
                    method: this.method(options),
                    headers: this.headers(options),
                    url: pageUrl,
                    encoding: null,
                    qs: this.queryParams(options),
                    json: this.json(options),
                    jar: this.state.getCookie(),
                    form: this.formData(options),
                    rejectUnauthorized: false,
                    timeout: options.timeout
                }, async (err, res, body) => {
    
                    console.log(` [ Response status code: ${res.statusCode} ]`)
    
                    if (err || res.statusCode > 399) {
                        if (options && options.printFileWhenError) {
                            await this.createFileError(res.body)
                        }
    
                        const errorMensage = `Error in the request: status ${res.statusCode} | ${res.statusMessage}`
    
                        if (options && !options.throwInReponseBigger200) {
                            console.error(errorMensage)
                        } else {
                            throw new Error(errorMensage)
                        }
                    }
    
                    if (options && options.sessions) {
                        this.state.setCookie(res, options.sessions)
                    } else {
                        this.state.setCookie(res)
                    }
    
                    if (this.json(options)) {
                        resolve({
                            dom: '',
                            body: body,
                            response: res
                        })
                    } else {
    
                        resolve({
                            dom: DomParse.parse(body, options),
                            body: body,
                            response: res
                        })
                    }
    
                })
            } catch(e) {
                throw e
            }
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

        for (let key of Object.keys(options.queryParams)) {
            qs[key] = options.queryParams[key];
        }

        return qs;
    }

    private static headers(options?: CreeperOptions): object {

        const headers = {}

        if (options && options.headers) {
            for (let key of Object.keys(options.headers)) {
                headers[key] = options.headers[key];
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

        for (let key of Object.keys(options.formData)) {
            form[key] = options.formData[key];
        }

        return form;
    }

    static buildCookiesHeader(additional?: Map<string, string>) {

        const cookiesList = JSON.parse(JSON.stringify(CreeperCall.getCreeperState().getCookie()))['_jar'].cookies

        let builder = '';

        for (var i = 0; i < cookiesList.length; i++) {
            const { key, value } = cookiesList[i]
            builder += `${key}=${value};`
        }

        if (additional) {
            additional.forEach((v, k) => {
                builder += `${k}=${v};`
            })
        }

        return builder
    }

    static getCookies(): { [key:string]: string } {
        const cookiesList = JSON.parse(JSON.stringify(CreeperCall.getCreeperState().getCookie()))['_jar'].cookies

        let cookieObject: { [key:string]: string } = {};

        for (var i = 0; i < cookiesList.length; i++) {
            const { key, value } = cookiesList[i]
            cookieObject[key] = value
        }

        return cookieObject
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