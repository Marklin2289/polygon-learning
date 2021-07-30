import { useState } from "react"
import { Input, Button, Alert, Space, Typography, Col } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useAppState } from '@arweave/hooks';
import axios from "axios";

const { TextArea } = Input;

const { Text } = Typography;

const data = `
<html>
  <head>
    <meta charset="UTF-8">
    <title>Info about arweave</title>
  </head>
  <body>
    Arweave is the best web3-related thing out there!!!
  </body>
</html>`

const Submit = () => {
    const [error, setError] = useState<string | null>(null);
    const [fetching, setFetching] = useState(false);
    const [txHash, setTxHash] = useState('');
    const { state, dispatch } = useAppState();

    const submitData = () => {
        setFetching(true)
		axios
			.post(`/api/arweave/submit`, { ...state, data })
			.then(res => {
                setTxHash(res.data)
                dispatch({
                    type: 'SetDataId',
                    dataId: res.data,
                })
				setFetching(false)
			})
			.catch(err => {
                console.error(err)
                setError(err.data)
				setFetching(false)
			})
	}

  return (
        <Col>
            <Space direction="vertical" size="large">
                <Space direction="vertical">
                    <TextArea style={{ minWidth: "400px", fontWeight: "bold" }} disabled={true}  defaultValue={data} rows={10} />
                    <Button type="primary" onClick={submitData}>Submit the data</Button>
                </Space>
                {error && <Alert type="error" closable message={error} /> }
                {fetching
                    ? <LoadingOutlined style={{ fontSize: 24 }} spin />
                    : txHash.length !== 0
                        ? <Alert
                            message={
                                <Text strong>{`The transaction have been succefully submitted`}</Text>
                            }
                            description={
                                <a href="#" target="_blank" rel="noreferrer">{txHash}</a>
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
};

export default Submit
