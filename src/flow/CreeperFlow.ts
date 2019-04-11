import { Creeper } from "../core/Creeper";

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

            const execute: FlowExecute = this.executions.get(key);

            console.log(`Execute step === ${key} ===`)

            const creeper: Creeper = await execute.execute()

            console.log(creeper.toString())

            creeper.destroy()
        }
    }

    contex(key: string, value?: any): any {
        if (value) {
            this.state.set(key, value);
        }

        return this.state.get(key);
    }
}

export interface FlowExecute {

    execute(): Promise<Creeper>;
}