enum PoFError {
  /// validator is not configured
  VALIDATOR_NOT_CONFIGURED = 11,
  /// not a slow wallet
  WALLET_NOT_SLOW = 12,
  /// validator is jailed
  IS_JAILED = 13,
  /// no enough vouches
  TOO_FEW_VOUCHES = 14,
  /// bid is zero
  BID_IS_ZERO = 15,
  /// bid has expired
  BID_EXPIRED = 16,
  /// not enough coin balance
  LOW_UNLOCKED_COIN_BALANCE = 17,
}

export const mapPoFErrors = (list: string[]): string[] => {
  return list.map((e) => {
    return PoFError[parseInt(e)]
  })
}
