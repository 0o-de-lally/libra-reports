import type { LibraClient } from "libra-ts-sdk"
import { allVouchersPayload, currentValidatorsPayload, eligibleValidatorsPayload, vouchersInSetPayload, vouchesGiven, vouchesReceived } from "libra-ts-sdk/src/payloads/validators"
import { accountBalancePayload } from "libra-ts-sdk/src/payloads/common"
import type { ValidatorAccount, ValidatorSet } from "../types/system"
import fs from "fs"
import path from "path"
import { maybeInitClient } from "../makeClient"

export class ReportValidator implements ValidatorSet {
  profiles: Map<string, ValidatorAccount>;

  constructor() {
    this.profiles = new Map<string, ValidatorAccount>()
  }

  async getValidators(client: LibraClient) {
    const requests = [
      client.postViewFunc(eligibleValidatorsPayload),
      client.postViewFunc(currentValidatorsPayload),
    ]

    const [eligible, activeSet] = await Promise.all(requests)

    const eligible_validators: string[] = eligible[0]
    const current_list: string[] = activeSet[0]

    eligible_validators.forEach((a) => {
      this.profiles.set(a, { address: a, in_val_set: false })
    })
    // prevent any missing state
    current_list.forEach((a) => {
      this.profiles.set(a, { address: a, in_val_set: true })
    })
  }

  async populateBalances(client: LibraClient) {
    let requests: Promise<any>[] = []
    this.profiles.forEach((p) => {
      requests.push(updateBalance(client, p))
    })

    console.log(requests.length)
    await Promise.all(requests)
  }

  async populateVouchers(client: LibraClient) {
    let requests: Promise<any>[] = []
    this.profiles.forEach((p) => {
      requests.push(updateVouchers(client, p))
    })

    console.log(requests.length)
    await Promise.all(requests)
  }

  saveToJson(filePath?: string) {
    let p = path.resolve(filePath ? filePath : __dirname)
    // if (!fs.existsSync(p)) throw `directory ${p} does not exist`
    if (!filePath) {
      p = p.concat('/validators.json')
    }

    let json = Object.fromEntries(this.profiles)
    fs.writeFileSync(p, JSON.stringify(json))
  }

  // format from template file
  saveToTxt(filePath?: string) {

    let p = path.resolve(filePath ? filePath : __dirname)

    if (!filePath) {
      p = p.concat('/validators.txt')
    }

    let out = writeTemplate(this)
    fs.writeFileSync(p, out)

  }
}

// get the current balance of the validator
export const updateBalance = async (client: LibraClient, profile: ValidatorAccount): Promise<ValidatorAccount> => {
  const bal_res = await client.postViewFunc(accountBalancePayload(profile.address))

  console.log(bal_res);

  profile.balance = {
    unlocked: bal_res[0],
    total: bal_res[1],
  }

  return profile
}

// get the vouches given and received for that validator
export const updateVouchers = async (client: LibraClient, profile: ValidatorAccount): Promise<ValidatorAccount> => {
  const requests = [
    client.postViewFunc(vouchesReceived(profile.address)),
    client.postViewFunc(vouchesGiven(profile.address)),
    client.postViewFunc(vouchersInSetPayload(profile.address))
  ]

  const [vouchReceived, vouchGiven, buddies_in_set_res] = await Promise.all(requests)

  profile.active_vouchers = buddies_in_set_res[0]
  profile.vouches_received = {
    addresses: vouchReceived[0],
    expiration: vouchReceived[1]
  }
  profile.vouches_given = {
    addresses: vouchGiven[0],
    expiration: vouchGiven[1]
  }

  return profile
}

export const writeTemplate = (set: ValidatorSet): string => {
  let text = ''

  text = text.concat('\nACTIVE VALIDATORS\n')
  text = text.concat('account ... balance\n')
  set.profiles.forEach((p) => {
    if (p.in_val_set) {
      text = text.concat(`${p.address.slice(0, 6)} ... ${p.balance?.total ?? 0 / 1000000}\n`)
    }
  })

  text = text.concat('\nPENDING VALIDATORS\n')

  set.profiles.forEach((p) => {
    if (!p.in_val_set) {
      text = text.concat(`${p.address.slice(0, 6)} ... ${p.balance?.total ?? 0 / 1000000}\n`)
    }
  })

  return text
}


export const readFromJson = (file: string): ReportValidator => {
  let p = path.resolve(file);
  if (!fs.existsSync(p)) throw `file ${p} does not exist`

  let str = fs.readFileSync(p).toString();
  let json: object = JSON.parse(str);
  console.log(json);
  let vs = new ReportValidator()

  Object.entries(json).forEach(([k, v]) => {

    vs.profiles.set(k, v)
  })

  return vs
}


export const cliEntry = async (file?: string) => {
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

  const currentPath = process.cwd();
  const p_json = currentPath.concat("/validators.json")
  report.saveToJson(p_json);

  const p_txt = currentPath.concat("/validators.txt")
  report.saveToTxt(p_txt);

}
