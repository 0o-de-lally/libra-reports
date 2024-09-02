import type { ReportValidator } from "./reports/validators"

export const getHandle = (address: string, rv: ReportValidator): string | undefined => {
  return rv.profiles.get(address)?.handle
}

export const mapHandles = (addresses: string[], rv: ReportValidator): string[] => {
  return addresses.map((a) => {
    return getHandle(a, rv) ?? 'unknown'
  })
}
