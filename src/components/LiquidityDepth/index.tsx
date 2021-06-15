import React from 'react'
import { Currency, Price, Token } from '@uniswap/sdk-core'
import { FeeAmount } from '@uniswap/v3-sdk'
import { DarkBlueCard } from 'components/Card'
import DensityChart from './DensityChart'
import { RowBetween } from 'components/Row'
import { Trans } from '@lingui/macro'
import { AutoColumn } from 'components/Column'

export default function LiquidityDepth({
  price,
  currencyA,
  currencyB,
  feeAmount,
  priceLower,
  priceUpper,
  onLeftRangeInput,
  onRightRangeInput,
}: {
  price: string | undefined
  currencyA: Currency | undefined
  currencyB: Currency | undefined
  feeAmount: FeeAmount | undefined
  priceLower?: Price<Token, Token>
  priceUpper?: Price<Token, Token>
  onLeftRangeInput: (typedValue: string) => void
  onRightRangeInput: (typedValue: string) => void
}) {
  return (
    <DarkBlueCard>
      <AutoColumn>
        <RowBetween>
          <Trans>Liquidity Distribution</Trans>
        </RowBetween>
        <DensityChart
          price={price}
          currencyA={currencyA}
          currencyB={currencyB}
          feeAmount={feeAmount}
          priceLower={priceLower}
          priceUpper={priceUpper}
          onLeftRangeInput={onLeftRangeInput}
          onRightRangeInput={onRightRangeInput}
        />
      </AutoColumn>
    </DarkBlueCard>
  )
}
