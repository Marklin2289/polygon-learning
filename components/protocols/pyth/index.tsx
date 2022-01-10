import ProtocolNav from 'components/shared/ProtocolNav/ProtocolNav';
import {getInnerState, getStepId} from 'utils/context';
import * as Steps from '@figment-pyth/components';
import {accountExplorer} from '@figment-pyth/lib';
import {PROTOCOL_STEPS_ID} from 'types';
import {useGlobalState} from 'context';

const Pyth: React.FC = () => {
  const {state} = useGlobalState();
  const {address, network} = getInnerState(state);
  const stepId = getStepId(state);

  return (
    <>
      <ProtocolNav
        address={address}
        network={network}
        accountExplorer={accountExplorer(network)}
      />
      {stepId === PROTOCOL_STEPS_ID.PYTH_CONNECT && <Steps.Connect />}
      {stepId === PROTOCOL_STEPS_ID.PYTH_SOLANA_WALLET && (
        <Steps.WalletAdapter />
      )}
      {stepId === PROTOCOL_STEPS_ID.PYTH_EXCHANGE && <Steps.Exchange />}
    </>
  );
};

export default Pyth;
