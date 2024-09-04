
import { test, expect } from "bun:test";
import { ReportValidator, readFromJson } from "../src/reports/validators";
import { maybeInitClient } from "../src/makeClient";
import path from "path";
import { lookup } from "../src/reports/whitepages";
import { vouchesReceived } from "libra-ts-sdk/src/payloads/validators";


test("can populate validators", async () => {
  let client = await maybeInitClient()

  let pv = new ReportValidator()

  await pv.getValidators(client)
  await pv.populateBalances(client)
  await pv.populateVouchers(client)
  await pv.populateGrade(client)
  await pv.populateErrors(client)

  const p = path.resolve("./validators.json")
  pv.saveToJson(p)
}, 15000)


test("can read", async () => {
  const p = path.resolve("./tests/validators.fixture.json")
  const vs = readFromJson(p)
  console.log(vs)
})

test("can write txt", async () => {
  const p = path.resolve("./tests/validators.json")
  const vs = readFromJson(p)
  vs.saveToTxt("./tests/")
  console.log(vs)
})


test("can update bids", async () => {
  let client = await maybeInitClient()

  let pv = new ReportValidator()
  await pv.getValidators(client)
  await pv.populateBids(client)

  console.log(pv);
})

test("can update grade", async () => {
  let client = await maybeInitClient()

  let pv = new ReportValidator()
  await pv.getValidators(client)
  await pv.populateGrade(client)

  console.log(pv);
})


test("can read", async () => {
  const p = path.resolve("./tests/validators.fixture.json")
  const vs = readFromJson(p)
  console.log(vs)
})

test("can populate handles", async () => {
  const p = path.resolve("./tests/validators.fixture.json")
  const pv = readFromJson(p)
  pv.populateHandles()

  console.log(pv);
})

test("can filter active vouches", async () => {
  const p = path.resolve("./tests/validators.fixture.json")
  const pv = readFromJson(p)
  const val = '0x9a710919b1a1e67eda335269c0085c91'
  const active = pv.getActiveVouchers(val)
  expect(active.length > 0)
})


test("can lookup", () => {
  let res = lookup("0x6122b508960bbdbbf28f38bc035c393ecf7cff54c3ce8282c735940eedd807a");
  expect(res == "Qusuy")
})

test("can sort", () => {
  const p = path.resolve("./tests/validators.fixture.json")
  const pv = readFromJson(p)
  pv.populateHandles()
  let out = pv.toSortedArray("handle")
  let o = out.map((a) => a.handle)
  expect(o[0] == "0xslipk")
  expect(o.pop() == "zoz")
})

test("can sort bids", () => {
  const p = path.resolve("./tests/validators.fixture.json")
  const pv = readFromJson(p)
  pv.populateHandles()
  let out = pv.toSortedArray("bid_value")
  let o = out.map((a) => a.bid_value)
  expect(o.pop() == 1000)
})


test("can fetch vouches", async () => {
  let client = await maybeInitClient()
  let res = await client.postViewFunc(vouchesReceived('0x77f2650cd59335a8b03f875b43376f26'))
  console.log(res)
})
