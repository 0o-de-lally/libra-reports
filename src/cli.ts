import { Command } from "commander";
import { template } from "handlebars";
import fs from "fs";
import path from "path";

export const program = new Command();

program
  .name('libra-report')
  .description('produces reports using api data')
  .version('0.0.1'); // TODO get actual version

program
  .option('-t, --template <path>', 'template file to use')
  .action(opts => {
    // let e =
    const absolutePath = path.resolve(opts.template)
    let e = fs.existsSync(absolutePath)
    if (!e) {
      throw "file does not exist"
    }
    opts.template = absolutePath
  })

program.parse();
