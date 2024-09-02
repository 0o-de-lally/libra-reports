import handlebars from "handlebars";
import fs from "fs/promises";
import { currentValidators } from "libra-ts-sdk";
import { maybeInitClient } from "./makeClient";


export interface Validators {
  current: string[]
}

export class ValReport implements Validators {
  current: string[];
  constructor() {
    this.current = []
  }

  async getCurrent() {
    let client = await maybeInitClient();
    let validators = await currentValidators(client);
    console.log(validators)
    this.current = validators
  }

  // format from template file
  async formatReport(file: string): Promise<string> {
    // compile the template
    let source = (await fs.readFile(file)).toString();
    var template = handlebars.compile(source);

    // call template as a function, passing in your data as the context
    var outputString = template(this.current);
    console.log(outputString)
    return outputString
  }

}
