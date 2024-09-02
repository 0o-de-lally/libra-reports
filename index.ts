import { program } from "./src/cli.ts"
import { cliEntry } from "./src/reports/validators.ts";


const main = () => {
  const options = program.opts();
  cliEntry(options.data)
}


main()
