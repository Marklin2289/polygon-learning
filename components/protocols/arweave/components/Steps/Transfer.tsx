import { useState } from "react"
import { Form, Input, Button, Alert, Space, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useAppState } from '@arweave/hooks';
import axios from "axios";

const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
};

const tailLayout = {
    wrapperCol: { offset: 4, span: 20 },
};

const { Text } = Typography;

const Transfer = () => {
    const [toAddress, _setToAddress] = useState('root.address');
    const [error, setError] = useState<string | null>(null);
    const [fetching, setFetching] = useState(false);
    const [txSignature, setTxSignature] = useState(null);
    const { state } = useAppState();

    const transfer = (values: any) => {
        const isValidAmount = parseFloat(values.amount);
        if (isNaN(isValidAmount)) {
            setError("Amount needs to be a valid number")
            throw Error('Invalid Amount')
        }
        const amount = values.amount;
        setFetching(true)
		axios
			.post(`/api/arweave/transfer`, { ...state, amount })
			.then(res => {
                setTxSignature(res.data)
				setFetching(false)
			})
			.catch(err => {
				console.error(err)
				setFetching(false)
			})
	}

  return (
    <Form
      {...layout}
      name="transfer"
      layout="horizontal"
      onFinish={transfer}
      initialValues={{
          from: state.address,
          amount: 7,
          to: toAddress,
      }}
    > 
      <Form.Item label="Sender" name="from" required>
        <Text code>{state.address}</Text>
      </Form.Item>

      <Form.Item label="Amount" name="amount" required tooltip="1 AR = 10**(12) WESTON">
        <Space direction="vertical">
          <Input suffix="AR" style={{ width: "200px" }} />
        </Space>
      </Form.Item>

      <Form.Item label="Recipeint" name="to" required>
        <Text code>{toAddress}</Text>
      </Form.Item>

      <Form.Item {...tailLayout}>
        <Button type="primary" htmlType="submit" disabled={fetching}>
          Submit Transfer
        </Button>
      </Form.Item>

      {
        fetching &&
          <Form.Item {...tailLayout}>
            <Space size="large">
              <LoadingOutlined style={{ fontSize: 24, color: "#1890ff" }} spin />
              <Text type="secondary">Transfer initiated. Waiting for confirmations...</Text>
            </Space>
          </Form.Item>
      }

      {txSignature &&
        <Form.Item {...tailLayout}>
          <Alert
            type="success"
            showIcon
            message={
              <Text strong>Transfer confirmed!</Text>
            }
            description={
                <Text>Transaction Id: { txSignature }</Text>
            }
          />
        </Form.Item>
      }
      
      {error &&
        <Form.Item {...tailLayout}>
          <Alert
            type="error"
            showIcon
            closable
            message={error}
            onClose={() => setError('')}
          />
        </Form.Item>
      }
    </Form>
  );
};

export default Transfer
