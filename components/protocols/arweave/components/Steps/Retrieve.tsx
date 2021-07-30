import { useState } from "react"
import { Input, Button, Alert, Space, Typography, Col } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useAppState } from '@arweave/hooks';
import axios from "axios";

const { TextArea } = Input;

const { Text } = Typography;

const Submit = () => {
    const [error, setError] = useState<string | null>(null);
    const [fetching, setFetching] = useState(false);
    const [data, setData] = useState('');
    const { state } = useAppState();
    console.log(state.dataId)
    const retrieveData = () => {
        setFetching(true)
		axios
			.post(`/api/arweave/retrieve`, { state })
			.then(res => {
                setData(res.data)
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
                    <Button type="primary" onClick={retrieveData}>Retrieve the data</Button>
                </Space>
                {error && <Alert type="error" closable message={error} /> }
                {fetching
                    ? <LoadingOutlined style={{ fontSize: 24 }} spin />
                    : data.length !== 0
                        ? <TextArea 
                            style={{ minWidth: "400px", fontWeight: "bold" }} 
                            disabled={true}  
                            defaultValue={data} rows={10} 
                    />
                    : null
                }
            </Space>
        </Col>
  );
};

export default Submit
