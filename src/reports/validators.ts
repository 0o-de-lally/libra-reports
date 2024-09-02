import type { LibraClient } from "libra-ts-sdk"
import { currentValidatorsPayload, eligibleValidatorsPayload, validatorBidPayload, validatorGradePayload, vouchersInSetPayload, vouchesGiven, vouchesReceived } from "libra-ts-sdk/src/payloads/validators"
import { accountBalancePayload } from "libra-ts-sdk/src/payloads/common"
import type { ValidatorAccount, ValidatorSet } from "../types/system"
import fs from "fs"
import path from "path"
import { lookup } from "./whitepages"

export class ReportValidator implements ValidatorSet {
  profiles: Map<string, ValidatorAccount>;

  constructor() {
    this.profiles = new Map<string, ValidatorAccount>()
  }

  async populateAll(client: LibraClient): Promise<ReportValidator> {
    await this.getValidators(client);

    // these requests do not need a specific order
    const requests = [
      this.populateHandles(),
      this.populateBalances(client),
      this.populateBids(client),
      this.populateGrade(client),
      this.populateVouchers(client),
    ]

    await Promise.all(requests)
    return this
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

  populateHandles() {
    this.profiles.forEach((p) => {
      p.handle = lookup(p.address)
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

  async populateBids(client: LibraClient) {
    let requests: Promise<any>[] = []
    this.profiles.forEach((p) => {
      requests.push(updateBids(client, p))
    })

    console.log(requests.length)
    await Promise.all(requests)
  }

  async populateGrade(client: LibraClient) {
    let requests: Promise<any>[] = []
    this.profiles.forEach((p) => {
      requests.push(updateGrade(client, p))
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

// get the bid value and expiry for an account
export const updateBids = async (client: LibraClient, profile: ValidatorAccount): Promise<ValidatorAccount> => {

  const bidResponse = await client.postViewFunc(validatorBidPayload(profile.address));

  profile.bid_value = bidResponse[0]
  profile.bid_expires = bidResponse[1]

  return profile
}

// get the performance of the validator for total proposal, and failed proposals
export const updateGrade = async (client: LibraClient, profile: ValidatorAccount): Promise<ValidatorAccount> => {

  const gradeResponse = await client.postViewFunc(validatorGradePayload(profile.address));
  console.log(gradeResponse)
  if (gradeResponse) {
    profile.grade = {
      grade_passing: gradeResponse[0],
      grade_accepted: gradeResponse[1],
      grade_failed: gradeResponse[2],
    }
  }


  return profile
}

export const writeTemplate = (set: ValidatorSet): string => {
  let text = ''

  text = text.concat('\nACTIVE VALIDATORS\n')
  text = text.concat('account, handle, balance\n')
  set.profiles.forEach((p) => {
    if (p.in_val_set) {
      text = text.concat(`${p.address}, ${p.handle},${p.balance?.total ?? 0 / 1000000}\n`)
    }
  })

  text = text.concat('\nPENDING VALIDATORS\n')

  set.profiles.forEach((p) => {
    if (!p.in_val_set) {
      text = text.concat(`${p.address}, ${p.handle},${p.balance?.total ?? 0 / 1000000}\n`)
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
