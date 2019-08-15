
import { CreeperCall } from "./handle/CreeperCall";
import replaceall from "replaceall"
import fs from "fs"
import { GlobalSessionConfig } from "./core/GlobalSessionConfig";
import { DomParse } from "./core/DomParse";
import { Response } from "request";

export class Creeper {

    private currentDom: CheerioStatic;

    private currentBody: object;

    private pageUrl: string;

    private result: boolean;

    constructor() {}

    async goto(pageUrl: string, options?: CreeperOptions): Promise<Response> {

        this.pageUrl = pageUrl;

        if(GlobalSessionConfig.session) {
            if(!options) {
                options = {}
            }

            if(!options.sessions) {
                options.sessions = GlobalSessionConfig.session;
            }
        }

        const { dom, body, response } = await CreeperCall.getPage(pageUrl, options)

        this.currentDom = dom;
        this.currentBody = body;

        return response
    }    

    body(): any {
        return this.currentBody;
    }

    toHtml(): string {
        
        if(!this.currentDom) {
            throw new Error(" [ ERROR: Page not initialize! use { goto } ] ");
        }

        return this.currentDom.html();
    }

    getText(selector: string): string {

        if(!this.currentDom) {
            throw new Error(" [ ERROR: Page not initialize! use { goto } ]");
        }

        const exists: boolean = this.exists(selector);

        if(!exists) {
            console.log(` [ WARNING: Elements not exists: ${selector} ]`)
        }

        return this.getValueBySelector(selector);
    }

    getNumber(selector: string): number {
        return this.convertNumber(this.getValueBySelector(selector))
    }

    exists(selector: string): boolean {
        if(!this.currentDom) {
            throw new Error(" [ ERROR: Page not initialize! use { goto } ] ");
        }

        return this.currentDom(selector).length > 0;
    }

    destroy(): boolean {
        this.currentDom = null;

        return this.result;
    }

    toString(): string {
        return ` [ PageUrl = ${this.pageUrl} ] `
    }

    getValuesSelect(selector: string, skipValueEmpty?: boolean): Array<any> {
        const list: Array<any> = new Array();
        this.currentDom(selector).find('option').each((i,op) => {
            const id = this.currentDom(op).attr('value');
            if(!(!id && skipValueEmpty)) {
                list.push({
                    id: id,
                    value: this.currentDom(op).text()
                })
            }
        })       
        return list;  
    }

    getTextAttribute(selector: string, attr: string): string {
        return this.currentDom(selector).attr(attr);
    }

    private getValueBySelector(selector) {
        return this.normalizeSpace(this.currentDom(selector).text())
    }

    private convertNumber(value: string, digits?: number): number {
        if (!value) {
            return null;
        }
    
        const number = replaceall(",", ".", replaceall("%", "", replaceall("*", "", value)))
    
        if (!parseFloat(number)) {
            return null
        }
    
        return Number(parseFloat(number).toFixed(digits ? digits : 2))
    }
    
    
    private normalizeSpace(value) {
        if (value === " ") {
            return ""
        }
        return value ? replaceall(`\n`, "", replaceall(`\t`, "", value.trim())) : value;
    }

    assertResult(condition: boolean) {
        this.result = condition;
    }
    
    async createFileWithHtml(name?: string): Promise<void> {
        const finalName = name ? name : `${new Date().getTime()}.html`
        await fs.writeFile(finalName, this.currentDom.html(), function(err) {
            if(err) {
                return console.log(err);
            }
            console.log(` [ The ${finalName} file was saved! ]`);
        })
    }

    setHtmlManual(html: string, encode?: string): void {
        this.currentDom = DomParse.parse(html, {encoding: encode})
    }

    parseTableToString(options: TableOptions): string {

        const tableList = this.parseTable(options);

        let builder = '';

        for(var i in tableList) {
            const tableObject = tableList[i];
            for(var j in tableObject) {
                const object = tableObject[j];
                builder += `${object}\n`
            }
        }

        return builder;
    }

    parseUlToList(selectorUl): Array<string> {

        const list = [];

        var rows = this.currentDom(selectorUl).find('li');

        for(var i = 0; i < rows.length; i++) {

            const value = this.currentDom(rows[i]).text().split("\n")

            list.push(value[0])
        }

        return list;
    }

    parseTable(options: TableOptions): Array<any> {
        
        const tableList = [];

        var rows = this.currentDom(options.selector).find('tr');

        const positionsMap: Map<number, string> = options.positions ? CreeperMap.convert(options.positions) : new Map()

        for (var i = options.skipHeader ? 1 : 0; i < rows.length; i++) {
            var current = rows[i];
            
            const tableName = this.currentDom(current).text().split("\n")

            const item = {}

            for(var j = 0; j < tableName.length; j++) {
                
                const value = this.normalizeSpace(tableName[j]);

                if(!value) {
                    continue;
                }

                const key = positionsMap.has(j) ? positionsMap.get(j) : j

                item[key] = value
            }

            if(options.extract) {
                options.extract.extract(this.currentDom(current), item)
            }

            tableList.push(item)
        }

        return tableList;
    }
}

export interface CreeperOptions {

    httpMethod?: string;

    params?: Map<string, string>;

    queryParams?: Map<string, string>;

    headers?: Map<string, string>;

    sessions?: Session;

    encoding?: string;

    json?: object;

    formData?: Map<string, string>;
    
    setCookieHeader?: boolean;

    printFileWhenError?: boolean;

    throwInReponseBigger200?: boolean
    
}

export class Session {

    private sessionMap: Map<string, string> = new Map()
    
    private globalDomain: string;

    logSetCookie: boolean;
    
    add(domain: string, name: string) {
        this.sessionMap.set(name, domain)
    }

    addGrobal(domain: string) {
        this.globalDomain = domain;
    }

    getDomain(name: string) {

        if(this.sessionMap.has(name)) {
            return this.sessionMap.get(name);
        }
        
        return this.globalDomain;
    }
}

export class CreeperFlow {

    private executions: Map<string, FlowExecute> = new Map()

    private state: Map<string, any> = new Map()

    constructor() {
        console.log("\n" +
            " _____                               \n" +
            "/  __ \\                              \n" +
            "| /  \\/_ __ ___  ___ _ __   ___ _ __ \n" +
            "| |   | '__/ _ \\/ _ \\ '_ \\ / _ \\ '__|\n" +
            "| \\__/\\ | |  __/  __/ |_) |  __/ |   \n" +
            " \\____/_|  \\___|\\___| .__/ \\___|_|   \n" +
            "                    | |              \n" +
            "                    |_|              \n")
    }

    step(name: string, execute: FlowExecute) {
        this.executions.set(name, execute);
    }

    async executeAll() {

        for (let key of this.executions.keys()) {

            console.log("\n\n")

            const execute: FlowExecute = this.executions.get(key);

            console.log(` [ Execute step === ${key} === ]`)

            const creeper: Creeper = await execute.execute()

            const result: boolean = creeper.destroy()

            if(result != null && !result) {
                throw new Error(`Assert result error in step ${key}`)
            }
        }
    }

    contex(key: string, value?: any): any {
        if (value) {
            this.state.set(key, value);
        }

        return this.state.get(key);
    }

    setGlobalSessionConfig(domain: string): void {

        const session: Session = new Session()
        session.addGrobal(domain)

        GlobalSessionConfig.session = session;
    }

    getSessionsJson(): string {
        return JSON.stringify(JSON.parse(JSON.stringify(CreeperCall.getCreeperState().getCookie()))['_jar'].cookies);
    }

    getCookiesString(additional?: Map<string, string>): string {
        return CreeperCall.buildCookiesHeader(additional);
    }

}

export interface FlowExecute {

    execute(): Promise<Creeper>;
}

export interface TableExtractExecute {

    extract(dom, item): void;
}

export interface TableOptions {

    selector: string

    skipHeader?: boolean

    positions?: Array<CreeperMap<number, string>>

    extract?: TableExtractExecute
}

export class CreeperMap<E, T> {

    key: E
    value: T

    static convert(list: Array<CreeperMap<any, any>>): Map<any, any> {
        const map: Map<any, any> = new Map();
        list.forEach(cMap => map.set(cMap.key, cMap.value))
        return map;
    }

}