import React, { useEffect } from 'react'
import { FeeAmount } from '@uniswap/v3-sdk'
import { Trans } from '@lingui/macro'
import { AutoColumn } from 'components/Column'
import { DynamicSection } from 'pages/AddLiquidity/styled'
import { TYPE } from 'theme'
import { RowBetween } from 'components/Row'
import { ButtonRadioChecked } from 'components/Button'
import styled from 'styled-components/macro'
import { skipToken } from '@reduxjs/toolkit/query/react'
import Badge from 'components/Badge'
import { useGetFeeTierDistributionQuery } from 'state/data/slice'

const ResponsiveText = styled(TYPE.label)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 12px;
  `};
`

const FeeTierPercentageBadge = ({ percentage }: { percentage: string }) => {
  return (
    <Badge>
      <TYPE.label fontSize={12}>
        {percentage === '0' ? <Trans>Not created</Trans> : <Trans>{percentage}% select</Trans>}
      </TYPE.label>
    </Badge>
  )
}

export default function FeeSelector({
  disabled = false,
  feeAmount,
  handleFeePoolSelect,
  token0,
  token1,
}: {
  disabled?: boolean
  feeAmount?: FeeAmount
  handleFeePoolSelect: (feeAmount: FeeAmount) => void
  token0?: string | undefined
  token1?: string | undefined
}) {
  const {
    isLoading,
    isUninitialized,
    isError,
    data: distributions,
  } = useGetFeeTierDistributionQuery(token0 && token1 ? { token0, token1 } : skipToken)

  // auto-select fee tier when available
  useEffect(() => {
    if (!isLoading && !isUninitialized && !isError && distributions) {
      const largestUsageFeeTier = Object.keys(distributions)
        .map((d) => Number(d))
        .filter((d: FeeAmount) => distributions[d] !== 0)
        .reduce((a: FeeAmount, b: FeeAmount) => (distributions[a] > distributions[b] ? a : b), -1)

      if (largestUsageFeeTier !== -1) {
        handleFeePoolSelect(largestUsageFeeTier)
      }
    }
  }, [isLoading, isUninitialized, isError, distributions, handleFeePoolSelect])

  // in case of loading or error, we can ignore the query
  const feeTierPercentages =
    !isLoading && !isUninitialized && !isError && distributions
      ? {
          [FeeAmount.LOW]: (distributions[FeeAmount.LOW] * 100).toFixed(0),
          [FeeAmount.MEDIUM]: (distributions[FeeAmount.MEDIUM] * 100).toFixed(0),
          [FeeAmount.HIGH]: (distributions[FeeAmount.HIGH] * 100).toFixed(0),
        }
      : undefined

  return (
    <AutoColumn gap="16px">
      <DynamicSection gap="md" disabled={disabled}>
        <TYPE.label>
          <Trans>Select Pool</Trans>
        </TYPE.label>
        <TYPE.main fontSize={14} fontWeight={400} style={{ marginBottom: '.5rem', lineHeight: '125%' }}>
          <Trans>Select a pool type based on your preferred liquidity provider fee.</Trans>
        </TYPE.main>
        <RowBetween>
          <ButtonRadioChecked
            width="32%"
            active={feeAmount === FeeAmount.LOW}
            onClick={() => handleFeePoolSelect(FeeAmount.LOW)}
          >
            <AutoColumn gap="sm" justify="flex-start">
              <ResponsiveText>
                <Trans>0.05% fee</Trans>
              </ResponsiveText>
              <TYPE.main fontWeight={400} fontSize="12px" textAlign="left">
                <Trans>Best for stable pairs.</Trans>
              </TYPE.main>

              {feeTierPercentages && <FeeTierPercentageBadge percentage={feeTierPercentages[FeeAmount.LOW]} />}
            </AutoColumn>
          </ButtonRadioChecked>
          <ButtonRadioChecked
            width="32%"
            active={feeAmount === FeeAmount.MEDIUM}
            onClick={() => handleFeePoolSelect(FeeAmount.MEDIUM)}
          >
            <AutoColumn gap="sm" justify="flex-start">
              <ResponsiveText>
                <Trans>0.3% fee</Trans>
              </ResponsiveText>
              <TYPE.main fontWeight={400} fontSize="12px" textAlign="left">
                <Trans>Best for most pairs.</Trans>
              </TYPE.main>

              {feeTierPercentages && <FeeTierPercentageBadge percentage={feeTierPercentages[FeeAmount.MEDIUM]} />}
            </AutoColumn>
          </ButtonRadioChecked>
          <ButtonRadioChecked
            width="32%"
            active={feeAmount === FeeAmount.HIGH}
            onClick={() => handleFeePoolSelect(FeeAmount.HIGH)}
          >
            <AutoColumn gap="sm" justify="flex-start">
              <ResponsiveText>
                <Trans>1% fee</Trans>
              </ResponsiveText>
              <TYPE.main fontWeight={400} fontSize="12px" textAlign="left">
                <Trans>Best for exotic pairs.</Trans>
              </TYPE.main>

              {feeTierPercentages && <FeeTierPercentageBadge percentage={feeTierPercentages[FeeAmount.HIGH]} />}
            </AutoColumn>
          </ButtonRadioChecked>
        </RowBetween>
      </DynamicSection>
    </AutoColumn>
  )
}
