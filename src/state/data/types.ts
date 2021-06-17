import { FeeAmount } from '@uniswap/v3-sdk'

export interface PoolTVL {
  asToken0: {
    feeTier: FeeAmount
    totalValueLockedToken0: number
    totalValueLockedToken1: number
  }[]
  asToken1: {
    feeTier: FeeAmount
    totalValueLockedToken0: number
    totalValueLockedToken1: number
  }[]
}

export interface FeeTierDistribution {
  [FeeAmount.LOW]: number
  [FeeAmount.MEDIUM]: number
  [FeeAmount.HIGH]: number
}
