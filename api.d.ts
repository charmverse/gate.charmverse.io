// interfaces served by api.charmverse.io

export type NotionGate = {
  createdAt: Date
  updatedAt: Date | null
  id: string
  spaceBlockIds: string[]
  spaceBlockUrls: string[]
  spaceDefaultUrl: string | null
  spaceDomain: string
  spaceIcon: string
  spaceName: string
  spaceId: string
  tokenAddress: string
  tokenName: string
  tokenSymbol: string
  tokenChainId: number
  tokenType: string
  tokenMin: number
  userId: string
}