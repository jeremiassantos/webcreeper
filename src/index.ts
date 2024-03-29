
import { CreeperCall } from "./handle/CreeperCall";
import replaceall from "replaceall"
import * as fs from "fs"
import { GlobalSessionConfig } from "./core/GlobalSessionConfig";
import { DomParse } from "./core/DomParse";
import { Response } from "request";

export class Creeper {

    private readonly MESSAGE_INVALID_DOM = ' [ ERROR: Invalid DOM, possible errors -> [Page not initialize! use { goto }, Dom not assigned due to another error referring to the page] ] '

    private currentDom: any;

    private currentBody: object;

    private pageUrl: string;

    private result: boolean;

    constructor() {}

    async goto(pageUrl: string, options?: CreeperOptions): Promise<Response> {

        this.pageUrl = pageUrl;

        options = this.getDefaultParams(options)

        const { dom, body, response } = await CreeperCall.getPage(pageUrl, options)

        this.currentDom = dom;
        this.currentBody = body;

        return response
    }
    
    private getDefaultParams(options?: CreeperOptions) {

        if(!options) {
            options = {}
        }

        const isNullOrUndefined = (value: any) => value == undefined || value == null

        if(isNullOrUndefined(options.setCookieHeader)) {
            options.setCookieHeader = true
        }

        if(GlobalSessionConfig.session) {

            if(!options.sessions) {
                options.sessions = GlobalSessionConfig.session;
            }
        }

        return options
    }

    body(): any {
        return this.currentBody;
    }

    toHtml(): string {
        
        if(!this.currentDom) {
            throw new Error(this.MESSAGE_INVALID_DOM);
        }

        return this.currentDom.html();
    }

    getText(selector: string): string {

        if(!this.currentDom) {
            throw new Error(this.MESSAGE_INVALID_DOM);
        }

        const exists: boolean = this.exists(selector);

        if(!exists) {
            console.log(` [ WARNING: Elements not exists: ${selector} ]`)
        }

        return this.getValueBySelector(selector);
    }

    getTextAndLink(selector: string): string {

        let text = this.getText(selector);

        var rows = this.currentDom(selector).find('a');

        for(var i = 0; i < rows.length; i++) {

            const href = this.currentDom(rows[i]).attr('href')

            const value = this.normalizeSpace(this.currentDom(rows[i]).text())

            if(href && value) {
                text = `${text} * Ref.: ${value} (${href}) *`
            }
        }

        return text
    }

    async awaitMilliseconds(milli: number) {
        const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

        await sleep(milli);
    }

    async awaitSeconds(seconds: number) {
        await this.awaitMilliseconds(seconds * 1000)
    }

    async awaitMinutes(minutes: number) {
        await this.awaitSeconds(minutes * 60)
    }

    getNumber(selector: string): number {
        return this.convertNumber(this.getValueBySelector(selector))
    }

    exists(selector: string): boolean {
        if(!this.currentDom) {
            throw new Error(this.MESSAGE_INVALID_DOM);
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
        this.currentDom(selector).find('option').each((i, op) => {
            const id = this.currentDom(op).attr('value');
            if(!(!id && skipValueEmpty)) {
                list.push({
                    id: id,
                    i,
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
        fs.writeFileSync(finalName, this.currentDom.html())
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

    getAttributesByChildren(selectorRoot: string, attributeTarget: string): Array<string> {

        const list: Array<string> = []

        var rows = this.currentDom(selectorRoot).children();

        for(var i = 0; i < rows.length; i++) {

            const value = this.currentDom(rows[i]).attr(attributeTarget)

            if(value) {
                list.push(value)
            }
        }

        return list;
    }

    getValuesByChildren(selectorRoot: string): Array<string> {

        const list: Array<string> = []

        var rows = this.currentDom(selectorRoot).children();

        for(var i = 0; i < rows.length; i++) {

            const value = this.normalizeSpace(this.currentDom(rows[i]).text())

            if(value) {
                list.push(value)
            }
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

    getCookies(): { [key:string]: string } {
        return CreeperCall.getCookies()
    }
}

export interface CreeperOptions {

    httpMethod?: string;

    params?: { [key:string]: string };

    queryParams?: { [key:string]: string };

    headers?: { [key:string]: string };

    sessions?: Session;

    encoding?: string;

    json?: object;

    formData?: { [key:string]: string };
    
    setCookieHeader?: boolean;

    printFileWhenError?: boolean;

    throwInReponseBigger200?: boolean

    // Ms
    timeout?: number
    
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