import { createApi } from '@reduxjs/toolkit/query/react'
import { gql } from 'graphql-request'
import { FeeAmount } from '@uniswap/v3-sdk'
import { reduce } from 'lodash'

import { graphqlBaseQuery, UNISWAP_V3_GRAPH_URL } from './common'
import { FeeTierDistribution, PoolTVL } from './types'

export const dataApi = createApi({
  reducerPath: 'dataApi',
  baseQuery: graphqlBaseQuery({
    baseUrl: UNISWAP_V3_GRAPH_URL,
  }),
  endpoints: (builder) => ({
    getFeeTierDistribution: builder.query<FeeTierDistribution, { token0: string; token1: string }>({
      query: ({ token0, token1 }) => ({
        document: gql`
          query pools($token0: Bytes!, $token1: Bytes!) {
            asToken0: pools(
              orderBy: totalValueLockedToken0
              orderDirection: desc
              where: { token0: $token0, token1: $token1 }
            ) {
              feeTier
              totalValueLockedToken0
              totalValueLockedToken1
            }
            asToken1: pools(
              orderBy: totalValueLockedToken0
              orderDirection: desc
              where: { token0: $token1, token1: $token0 }
            ) {
              feeTier
              totalValueLockedToken0
              totalValueLockedToken1
            }
          }
        `,
        variables: {
          token0,
          token1,
        },
      }),
      transformResponse: (poolTvl: PoolTVL) => {
        const all = poolTvl.asToken0.concat(poolTvl.asToken1)

        // sum tvl for token0 and token1 by fee tier
        const tvlByFeeTer = all.reduce(
          (acc, value) => {
            acc[value.feeTier][0] += Number(value.totalValueLockedToken0)
            acc[value.feeTier][1] += Number(value.totalValueLockedToken1)
            return acc
          },
          {
            [FeeAmount.LOW]: [0, 0],
            [FeeAmount.MEDIUM]: [0, 0],
            [FeeAmount.HIGH]: [0, 0],
          }
        )

        // sum total tvl for token0 and token1
        const [sumToken0Tvl, sumToken1Tvl] = reduce(
          tvlByFeeTer,
          (acc: [number, number], value) => {
            acc[0] += value[0]
            acc[1] += value[1]
            return acc
          },
          [0, 0]
        )

        const mean = (tvl0: number, sumTvl0: number, tvl1: number, sumTvl1: number) =>
          (tvl0 + tvl1) / (sumTvl0 + sumTvl1) || 0

        return {
          [FeeAmount.LOW]: mean(
            tvlByFeeTer[FeeAmount.LOW][0],
            sumToken0Tvl,
            tvlByFeeTer[FeeAmount.LOW][1],
            sumToken1Tvl
          ),
          [FeeAmount.MEDIUM]: mean(
            tvlByFeeTer[FeeAmount.MEDIUM][0],
            sumToken0Tvl,
            tvlByFeeTer[FeeAmount.MEDIUM][1],
            sumToken1Tvl
          ),
          [FeeAmount.HIGH]: mean(
            tvlByFeeTer[FeeAmount.HIGH][0],
            sumToken0Tvl,
            tvlByFeeTer[FeeAmount.HIGH][1],
            sumToken1Tvl
          ),
        }
      },
    }),
  }),
})

export const { useGetFeeTierDistributionQuery } = dataApi