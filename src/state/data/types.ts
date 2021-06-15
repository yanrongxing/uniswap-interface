import { FeeAmount } from '@uniswap/v3-sdk'

export interface LiquidityByPositions {
  asToken0: {
    pool: {
      feeTier: FeeAmount
    }
    liquidity: number
  }[]
  asToken1: {
    pool: {
      feeTier: FeeAmount
    }
    liquidity: number
  }
}

export interface FeeTierUsage {
  [FeeAmount.LOW]: number
  [FeeAmount.MEDIUM]: number
  [FeeAmount.HIGH]: number
}
