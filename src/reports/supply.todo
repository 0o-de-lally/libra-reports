import { supplyStore } from '.'
import { postViewFunc } from '../api'
import { COIN_SCALING, FINAL_SUPPLY } from '../constants'
import type { SupplyData } from '../types'

export const supplySimple = async (): Promise<SupplyData> => {
  const supply_query = await postViewFunc({
    function: '0x1::supply::get_stats',
    arguments: [],
    type_arguments: [],
  });
  console.log(supply_query);

  const total = supply_query[0] / COIN_SCALING
  const burn = (FINAL_SUPPLY - total)
  const infra = supply_query[3] / COIN_SCALING
  const comm = supply_query[2] / COIN_SCALING
  const slow = supply_query[1] / COIN_SCALING
  const circulating = supply_query[4] / COIN_SCALING
  const user = (slow + circulating)
  const s = {
    final: FINAL_SUPPLY,
    total,
    burn,
    infra,
    comm,
    slow,
    user,
    circulating,
  }
  supplyStore.set(s)
  return s
}

export const populateSupply = async (): Promise<SupplyData> => {
  const supply_type: SupplyData = {
    final: 10_000_000_000,
    total: 0,
    burn: 0,
    infra: 0,
    comm: 0,
    slow: 0,
    user: 0,
    circulating: 0,
  }

  const total_query = postViewFunc({
    function: '0x1::libra_coin::supply',
    arguments: [],
    type_arguments: [],
  }).then((r) => {
    supply_type.total = r[0] / COIN_SCALING
  })

  const infra_query = postViewFunc({
    function: '0x1::infra_escrow::infra_escrow_balance',
    arguments: [],
    type_arguments: [],
  }).then((r) => {
    supply_type.infra = r[0] / COIN_SCALING
  })

  const comm_query = postViewFunc({
    function: '0x1::donor_voice::get_root_registry',
    arguments: [],
    type_arguments: [],
  })
    .then(async (r) => {
      const address_list: string[] = r[0]

      const requests = address_list.map((addr) => {
        return postViewFunc({
          function: '0x1::ol_account::balance',
          arguments: [addr],
          type_arguments: [],
        })
      })

      return await Promise.all(requests).catch(() => ['0', '0'])
    })
    .then((bal_array) => {
      const total = bal_array
        .map((e) => parseInt(e[1])) //1th is total
        .reduce((prev, current) => {
          return prev + current
        }, 0)
      supply_type.comm = total / COIN_SCALING
    })
    .catch((e) => {
      console.log('ERROR get_root_registry:', e)
    })

  const slow_query = postViewFunc({
    function: '0x1::slow_wallet::get_slow_list',
    arguments: [],
    type_arguments: [],
  })
    .then(async (r) => {
      const address_list: string[] = r[0]

      const requests = address_list.map((addr) => {
        return postViewFunc({
          function: '0x1::ol_account::balance',
          arguments: [addr],
          type_arguments: [],
        })
      })

      return await Promise.all(requests).catch(() => ['0', '0'])
    })
    .then((bal_array) => {
      const total = bal_array
        .map((e) => parseInt(e[0])) //0th is unlocked
        .reduce((prev, current) => {
          return prev + current
        }, 0)
      supply_type.slow = total / COIN_SCALING
    })
    .catch((e) => {
      console.log('ERROR get_slow_list:', e)
    })

  await Promise.all([total_query, infra_query, comm_query, slow_query])

  supply_type.burn = supply_type.final - supply_type.total
  supply_type.user = supply_type.final - supply_type.burn - supply_type.infra - supply_type.comm
  supply_type.circulating = supply_type.user - supply_type.slow

  supplyStore.set(supply_type)
  return supply_type
}
