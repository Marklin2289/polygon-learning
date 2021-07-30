import { Typography, Popover, Button } from 'antd';
import { useAppState } from '@arweave/hooks'
import type { EntryT } from '@arweave/types';

const { Text, Paragraph } = Typography;

export default function Nav() {
    const { state } = useAppState();
    const { address, dataId, stateId } = state;
    const networkId = 'arweave.testnet'

    const displaySecretKey = (address: string) => `${(address).slice(0,5)}...${(address).slice(-5)}`
    const displayNetworkId = (networkId: string) => networkId
    const displayDataId = (dataId: string) => `${(dataId).slice(0,5)}...${(dataId).slice(-5)}`
    const displayStateId = (stateId: string) => `${(stateId).slice(0,5)}...${(stateId).slice(-5)}`

    const Entry = ({ msg, display, value }: EntryT) => {
        return (
            <Paragraph copyable={{ text: value }}>
                <Text strong>{msg}</Text>
                <Text code>{display(value)}</Text>
            </Paragraph>
        )
    }

    const AppState = () => {
        return (
        <>
            <Entry msg={"Network: "} value={networkId} display={displayNetworkId} />
            {address && <Entry msg={"Address: "} value={address} display={displaySecretKey} />}
            {dataId && <Entry msg={"dataTx: "} value={dataId} display={displayDataId} />}
            {stateId && <Entry msg={"stateTx: "} value={stateId} display={displayStateId} />}
        </>
        )
    }

    return (
        <div style={{ position: "fixed", top: 20, right: 20 }}>
            <Popover content={AppState} placement="rightBottom">
                <Button type="primary">Storage</Button>
            </Popover>
        </div>
    )
}
