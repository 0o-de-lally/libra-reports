
import { test } from "bun:test";
import { PopulateVals, readFromJson } from "../src/reports/validators";
import { maybeInitClient } from "../src/makeClient";
import path from "path";


test("can populate validators", async () => {
  let client = await maybeInitClient()

  let pv = new PopulateVals()

  await pv.getValidators(client)
  await pv.populateBalances(client)
  await pv.populateVouchers(client)

  const p = path.resolve(".")
  pv.saveToJson(p)
})


test("can read", async () => {
  const p = path.resolve("./tests/validators.json")
  const vs = readFromJson(p)
  console.log(vs)
})

test("can write txt", async () => {
  const p = path.resolve("./tests/validators.json")
  const vs = readFromJson(p)
  vs.saveToTxt("./tests/")
  console.log(vs)
})
