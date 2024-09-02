import { program } from "./src/cli.ts"
import { ValReport } from "./src/validator.ts";


const options = program.opts();

let vReport = new ValReport();

await vReport.formatReport(options.template)
