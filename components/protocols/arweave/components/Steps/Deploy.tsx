import { Alert, Col, Button, Space, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useAppState } from '@arweave/hooks'
import { useState } from 'react';
import axios from 'axios';

const { Text } = Typography;

const Deploy = () => {
    const [fetching, setFetching] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [txStateId, setTxStateId] = useState<string>('');
    const { state, dispatch } = useAppState();

    const deployContract = () => {
        setError(null)
        setFetching(true)
        axios.post(`/api/arweave/deploy`, state)
            .then(res => {
                setTxStateId(res.data)
                dispatch({
                    type: 'SetStateId',
                    stateId: res.data,
                })
                setFetching(false)
            })
            .catch(err => {
                setFetching(false)
                setError(err.data)
            })
    }

    return (
        <Col>
            <Space direction="vertical" size="large">
                <Space direction="vertical">
                    <Text>Time to deploy your first <span style={{ fontWeight: "bold" }}>SmartWave contract</span></Text>
                    <Button type="primary" onClick={deployContract}>Deploy !</Button>
                </Space>
                {error && <Alert type="error" closable message={error} /> }
                {fetching
                    ? <LoadingOutlined style={{ fontSize: 24 }} spin />
                    : txStateId.length != 0
                        ? <Alert
                            message={
                                <Text strong>{`Transaction of the state: ${txStateId}`}</Text>
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

export default Deploy
