export interface IndexData {
  chain_id: number
  epoch: string
  ledger_version: string
  oldest_ledger_version: string
  ledger_timestamp: string
  node_role: string
  oldest_block_height: string
  block_height: string
  git_hash: string
}

export interface SystemInfo {
  consensus_reward: number
  fees: number | string
  epoch_duration: string
  chain_id: number
  epoch: string
  ledger_version: string
  oldest_ledger_version: string
  ledger_timestamp: string
  node_role: string
  oldest_block_height: string
  block_height: string
  git_hash: string
  infra_escrow: number
  validator_seats: number
  vdf: number[]
  boundary_status: object
}

export interface SupplyData {
  final: number
  total: number
  burn: number
  infra: number
  comm: number
  slow: number
  user: number
  circulating: number
}

export interface User {
  address: string
}

export interface ProofOfFee {
  val_universe: string[]
  bidders: string[]
  bids: number[]
  qualified: string[]
}

export interface SlowWalletBalance {
  unlocked: number
  total: number
}

export interface VouchList {
  addresses: string[],
  expiration: number[],
}

export interface Grade {
  grade_passing: boolean,
  grade_accepted: number,
  grade_failed: number,
}

export interface ValidatorAccount {
  address: string,
  handle?: string,
  in_val_set?: boolean,
  active_vouchers?: string[],
  vouches_received?: VouchList,
  vouches_given?: VouchList,
  balance?: SlowWalletBalance,
  bid_value?: number,
  bid_expires?: number,
  grade?: Grade,
}

export interface ValidatorSet {
  profiles: Map<string, ValidatorAccount>
}

export interface govEventData {
  data: {
    num_votes: string
    proposal_id: string
    should_pass: boolean
    stake_pool: string
    voter: string
  }
}

export interface Transaction {
  sender: string
  receiver: string
  amount: number
  ledger_version: number
  ledger_timestamp: number
}
