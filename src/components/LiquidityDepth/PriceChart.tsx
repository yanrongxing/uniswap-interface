import React from 'react'
import { useGetInitializedTicksQuery } from 'state/data/slice'
import { Currency } from '@uniswap/sdk-core'
import { FeeAmount, Pool, TICK_SPACINGS } from '@uniswap/v3-sdk'
import { usePool } from 'hooks/usePools'
import { skipToken } from '@reduxjs/toolkit/dist/query'

const DEFAULT_SURROUNDING_TICKS = 300

export default function PriceChart({
  currencyA,
  currencyB,
  feeAmount,
}: {
  currencyA: Currency | undefined
  currencyB: Currency | undefined
  feeAmount: FeeAmount | undefined
}) {
  const pool = usePool(currencyA, currencyB, feeAmount)

  const poolAddress =
    currencyA && currencyB && feeAmount
      ? Pool.getAddress(currencyA?.wrapped, currencyB?.wrapped, feeAmount).toLowerCase()
      : undefined

  const tickSpacing = feeAmount && TICK_SPACINGS[feeAmount]
  const activeTick = pool[1]?.tickCurrent

  const tickIdxLowerBound = activeTick && tickSpacing ? activeTick - DEFAULT_SURROUNDING_TICKS * tickSpacing : undefined
  const tickIdxUpperBound = activeTick && tickSpacing ? activeTick + DEFAULT_SURROUNDING_TICKS * tickSpacing : undefined

  const { data, error, isLoading } = useGetInitializedTicksQuery(
    {
      // @ts-expect-error id passed must be a number, but we don't call it when it isn't a number
      poolAddress,
      // @ts-expect-error id passed must be a number, but we don't call it when it isn't a number
      tickIdxLowerBound,
      // @ts-expect-error id passed must be a number, but we don't call it when it isn't a number
      tickIdxUpperBound,
    },
    {
      skip: poolAddress === undefined || tickIdxLowerBound === undefined || tickIdxUpperBound === undefined,
    }
  )

  //if (error) return <div>{JSON.stringify(error)}</div>
  if (isLoading) return <div>Loading...</div>

  return <div>Price Chart: {JSON.stringify(data)}</div>
}
