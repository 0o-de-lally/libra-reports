import { program, start } from "./src/cli/init.ts"
import { validatorCommand } from "./src/cli/validatorCommand.ts";


const main = () => {
  start()
  const options = program.opts();
  validatorCommand(options.data)
}

main()
