// interfaces served by api.charmverse.io

export type LockType = 'ERC20' | 'ERC721' | 'POAP' | 'whitelist';

export type NotionGateLock = {
  id: string
  // special notion properties
  spaceBlockIds: string[]
  spaceBlockUrls: string[]
  spaceDefaultUrl?: string | null
  // requirements
  lockType: LockType
  addressWhitelist: string[]
  tokenAddress?: string | null
  tokenBlacklist: string[]
  tokenChainId?: number | null
  tokenName?: string | null
  tokenSymbol?: string | null
  tokenMin?: number | null
  POAPEventId?: number | null
  POAPEventName?: string | null
}

export type NotionGateSettings = {
  createdAt: string//Date
  // unused fields
  //updatedAt: Date | null
  //userId: string
  id: string
  spaceDomain: string
  spaceIcon?: string | null
  spaceName: string
  spaceId: string
  // logical fields
  spaceIsAdmin: boolean
  // spaceIsConnected: boolean
}

export type NotionGateSettingsWithLocks = NotionGate & {
  locks: NotionGateLock[]
}