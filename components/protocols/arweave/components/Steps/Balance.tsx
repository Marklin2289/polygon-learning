import { useState } from 'react';
import { Alert, Col, Input, Button, Space, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useAppState } from '@arweave/hooks'
import axios from 'axios';

const { Text } = Typography;

const AR_IN_WESTON = 10**12;

const Balance = () => {
    const [fetching, setFetching] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [balance, setBalance] = useState<number>(0);
    const { state } = useAppState();

    const getBalance = () => {
        setError(null)
        setFetching(true)
        axios.post(`/api/arweave/balance`, state)
            .then(res => {
                const weston = parseFloat(res.data)
                const intoAR = (weston / AR_IN_WESTON).toFixed();
                setBalance(parseFloat(intoAR))
                setFetching(false)
            })
            .catch(err => {
                setFetching(false)
                setBalance(0)
                setError(err.data)
            })
    }

    return (
        <Col>
            <Space direction="vertical" size="large">
                <Space direction="vertical">
                    <Text>Below the <span style={{ fontWeight: "bold" }}>address</span> you generated previously:</Text>
                    <Input style={{ width: "500px", fontWeight: "bold" }} disabled={true}  defaultValue={state.address} />
                    <Button type="primary" onClick={getBalance}>Check Balance</Button>
                </Space>
                {error && <Alert type="error" closable message={error} /> }
                {fetching
                    ? <LoadingOutlined style={{ fontSize: 24 }} spin />
                    : balance != 0
                        ? <Alert
                            message={
                                <Text strong>{`This address has a balance of ${balance} Arweave`}</Text>
                            }
                            type="success"
                            closable
                            showIcon
                        />
                    : null
                }
            </Space>
        </Col>
    );
}

export default Balance
