import { CreeperState } from "./CreeperState";

export class Creeper {

    private creeperState: CreeperState;

    goto(pageUrl: string): void {

        this.creeperState = new CreeperState()

    }    

    toHtml(): string {
        throw new Error("Method not implemented.");
    }

    getTextBySelector(selector: string) {

    }

    destroy(): void {
        this.creeperState = null;
    }
}