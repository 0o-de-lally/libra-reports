import { maybeInitClient } from "../makeClient";
import { readFromJson, ReportValidator } from "../reports/validators";


export const validatorCommand = async (file?: string) => {
  let client = await maybeInitClient()

  let report: ReportValidator;

  if (file) {
    report = readFromJson(file)
  } else {
    report = new ReportValidator()
    await report.getValidators(client)
    await report.populateBalances(client)
    await report.populateVouchers(client)
  }

  report.populateHandles()

  const currentPath = process.cwd();
  const p_json = currentPath.concat("/validators.json")
  report.saveToJson(p_json);

  const p_txt = currentPath.concat("/validators.txt")
  report.saveToTxt(p_txt);

}
