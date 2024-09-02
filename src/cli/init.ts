import { Command } from "commander";
import fs from "fs";
import path from "path";

export let program: Command;

export const start = () => {
  program = new Command()
  program
    .name('libra-report')
    .description('produces reports using api data')
    .version('0.0.1'); // TODO get actual version

  program
    .option('-d, --data <path>', 'path to json data to use, otherwise will query api')
    .action(opts => {
      if (opts.data) {
        const absolutePath = path.resolve(opts.data)
        let e = fs.existsSync(absolutePath)
        if (!e) {
          throw "file does not exist"
        }
        opts.data = absolutePath
      }

    })

  program.parse();
}
