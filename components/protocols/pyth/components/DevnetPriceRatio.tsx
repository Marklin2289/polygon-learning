import {Card, Alert, Row, Col, Statistic} from 'antd';

export const DevnetPriceRatio = ({
  devnetToMainnetPriceRatioRef,
}: {
  devnetToMainnetPriceRatioRef: {usdc_sol: number; sol_usdc: number};
}) => {
  return (
    <Card>
      <Alert
        message="Devnet Swap Rate"
        description="The swap rate in devnet is a lot different then what's in mainnet"
        type="warning"
        showIcon
      />
      <Row>
        <Col span={12}>
          <Statistic
            value={
              devnetToMainnetPriceRatioRef.usdc_sol === 1
                ? 'waiting first tx'
                : devnetToMainnetPriceRatioRef.usdc_sol.toFixed(6)
            }
            prefix={'$'}
            title={'1 Sol to USDC'}
          />
        </Col>
        <Col span={12}>
          <Statistic
            value={
              devnetToMainnetPriceRatioRef.sol_usdc === 1
                ? 'waiting first tx'
                : devnetToMainnetPriceRatioRef.sol_usdc.toFixed(6)
            }
            prefix={'◎'}
            title={'1 USDC to SOL'}
          />
        </Col>
      </Row>
    </Card>
  );
};
