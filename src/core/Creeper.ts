import { CreeperState } from "./CreeperState";
import { CreeperCall } from "../handle/CreeperCall";

import replaceall from "replaceall"

export class Creeper {

    private creeperState: CreeperState;

    private currentDom;

    private pageUrl;

    async goto(pageUrl: string, options?: CreeperOptions) {

        this.pageUrl = pageUrl;

        this.creeperState = new CreeperState()

        this.currentDom = await CreeperCall.getPage(pageUrl, options)
    }    

    toHtml(): string {
        
        if(!this.currentDom) {
            throw new Error("Page not initialize! use { goto }");
        }

        return this.currentDom.html();
    }

    getText(selector: string): string {

        if(!this.currentDom) {
            throw new Error("Page not initialize! use { goto }");
        }

        const exists: boolean = this.exists(selector);

        if(!exists) {
            console.log(`WARNING: Elements not exists: ${selector}`)
        }

        return this.getValueBySelector(selector);
    }

    exists(selector: string): boolean {
        if(!this.currentDom) {
            throw new Error("Page not initialize! use { goto }");
        }

        return this.currentDom(selector).length > 0;
    }

    destroy(): void {
        this.creeperState = null;
        this.currentDom = null;
    }

    toString(): string {
        return `PageUrl= ${this.pageUrl}`
    }

    private getValueBySelector(selector) {
        return this.normalizeSpace(this.currentDom(selector).text())
    }
    
    private normalizeSpace(value) {
        if (value === " ") {
            return ""
        }
        return value ? replaceall(`\n`, "", replaceall(`\t`, "", value.trim())) : value;
    }
    
}

export interface CreeperOptions {

    httpMethod?: string;

    params?: Map<string, string>;

    queryParams?: Map<string, string>;
}