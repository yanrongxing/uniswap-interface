import { BaseQueryFn, createApi } from '@reduxjs/toolkit/query/react'
import { DocumentNode } from 'graphql'
import { ClientError, request, gql } from 'graphql-request'

// Raw tick returned from GQL
interface Tick {
  tickIdx: string
  liquidityGross: string
  liquidityNet: string
  price0: string
  price1: string
}

interface SurroundingTicksResult {
  ticks: Tick[]
}

export const graphqlBaseQuery =
  ({
    baseUrl,
  }: {
    baseUrl: string
  }): BaseQueryFn<{ document: string | DocumentNode; variables?: any }, unknown, ClientError> =>
  async ({ document, variables }) => {
    try {
      return { data: await request(baseUrl, document, variables) }
    } catch (error) {
      if (error instanceof ClientError) {
        return { error }
      }
      throw error
    }
  }

export const dataApi = createApi({
  reducerPath: 'dataApi',
  baseQuery: graphqlBaseQuery({
    baseUrl: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-testing',
  }),
  endpoints: (builder) => ({
    getInitializedTicks: builder.query<
      SurroundingTicksResult,
      { poolAddress: string; tickIdxLowerBound: number; tickIdxUpperBound: number }
    >({
      query: ({ poolAddress, tickIdxLowerBound, tickIdxUpperBound }) => ({
        document: gql`
          query surroundingTicks(
            $poolAddress: String!
            $tickIdxLowerBound: BigInt!
            $tickIdxUpperBound: BigInt!
            $skip: Int!
          ) {
            ticks(
              first: 1000
              skip: $skip
              where: { poolAddress: $poolAddress, tickIdx_lte: $tickIdxUpperBound, tickIdx_gte: $tickIdxLowerBound }
            ) {
              tickIdx
              liquidityGross
              liquidityNet
              price0
              price1
            }
          }
        `,
        variables: {
          poolAddress,
          tickIdxLowerBound,
          tickIdxUpperBound,
          skip: 0,
        },
      }),
    }),
  }),
})

export const { useGetInitializedTicksQuery } = dataApi
