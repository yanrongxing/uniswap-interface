import { createApi } from '@reduxjs/toolkit/query/react'
import { gql } from 'graphql-request'
import { FeeAmount } from '@uniswap/v3-sdk'

import { graphqlBaseQuery, UNISWAP_V3_GRAPH_URL } from './common'
import { FeeTierDistribution, LiquidityByPositions } from './types'

export const dataApi = createApi({
  reducerPath: 'dataApi',
  baseQuery: graphqlBaseQuery({
    baseUrl: UNISWAP_V3_GRAPH_URL,
  }),
  endpoints: (builder) => ({
    getFeeTierDistribution: builder.query<FeeTierDistribution, { token0: string; token1: string }>({
      query: ({ token0, token1 }) => ({
        document: gql`
          query positions($token0: Bytes!, $token1: Bytes!) {
            asToken0: positions(orderBy: liquidity, orderDirection: desc, where: { token0: $token0, token1: $token1 }) {
              pool {
                feeTier
              }
              liquidity
            }
            asToken1: positions(orderBy: liquidity, orderDirection: desc, where: { token0: $token1, token1: $token0 }) {
              pool {
                feeTier
              }
              liquidity
            }
          }
        `,
        variables: {
          token0,
          token1,
        },
      }),
      transformResponse: (positions: LiquidityByPositions) => {
        const all = positions.asToken0.concat(positions.asToken1)

        const byFeeTier = {
          [FeeAmount.LOW]: 0,
          [FeeAmount.MEDIUM]: 0,
          [FeeAmount.HIGH]: 0,
        }
        let sum = 0

        all.forEach((mint) => {
          const liquidity = Number(mint.liquidity)
          byFeeTier[mint.pool.feeTier] = byFeeTier[mint.pool.feeTier] + liquidity
          sum += liquidity
        })

        const res: FeeTierDistribution = {
          [FeeAmount.LOW]: byFeeTier[FeeAmount.LOW] / sum || 0,
          [FeeAmount.MEDIUM]: byFeeTier[FeeAmount.MEDIUM] / sum || 0,
          [FeeAmount.HIGH]: byFeeTier[FeeAmount.HIGH] / sum || 0,
        }

        return res
      },
    }),
  }),
})

export const { useGetFeeTierDistributionQuery } = dataApi
