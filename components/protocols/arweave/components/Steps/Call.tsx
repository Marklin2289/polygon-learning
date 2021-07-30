import { useEffect, useState } from 'react';
import { Alert, Col, Input, Button, Space, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAppState } from '@arweave/hooks'

const { Text } = Typography;

type ContractStateT= {
    balances: {
        [key: string]: number
    }
}

const Call = () => {
    const [fetching, setFetching] = useState<boolean>(false);
    const [reseting, setReseting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [txhash, setTxhash] = useState<string>('');
    const [lastState, setLastState] = useState<ContractStateT | null>(null);
    const { state } = useAppState();

    useEffect(() => {
        const contractCallView = () => {
            setError(null)
            setFetching(true)
            axios.post(`/api/arweave/callGet`, state)
                .then(res => {
                    setLastState(res.data)
                    setFetching(false)
                })
                .catch(err => {
                    const data = err.response.data
                    setFetching(false)
                    setError(data.message)
                })
        }
        contractCallView();
    }, [txhash, state])

    const contractCallFunction = () => {
        setError(null)
        setReseting(true)
        axios.post(`/api/arweave/callSet`, state)
            .then(res => {
                setTxhash(res.data)
                setReseting(false)
            })
            .catch(err => {
                const data = err.response.data
                setReseting(false)
                setError(data.message)
            })
    }

    return (
    <>
        <Space direction="vertical" size="large">
        <Text>Below the latestest state produce by the contract:</Text>
        <Col>
            {fetching
                ? <LoadingOutlined style={{ fontSize: 24 }} spin />
                : <Alert style={{ fontWeight: "bold", textAlign: "center" }} type="success" closable={false} message={JSON.stringify(lastState)} />
            }
        </Col>
        <Col>
            <Space direction="vertical" size="large">
                <Button type="primary" onClick={contractCallFunction}>Call the contract</Button>
                {error && <Alert type="error" closable message={error} /> }
                {reseting
                    ? <LoadingOutlined style={{ fontSize: 24 }} spin />
                    : txhash.length !== 0
                        ? <Alert
                            message={
                                <Text strong>{`The message has been reset`}</Text>
                            }
                            description={
                                <a href="#" target="_blank" rel="noreferrer">Transaction id: {txhash}</a>
                            }
                            type="success"
                            closable
                            showIcon
                        />
                    : null
                }
            </Space>
        </Col>
        </Space>
    </>
    );
}

export default Call
