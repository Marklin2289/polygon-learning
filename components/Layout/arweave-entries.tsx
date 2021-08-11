import {
    PieChartOutlined,
} from '@ant-design/icons';

type EntryT = {
	key: string,
    id: string,
	icon: JSX.Element,
	title: string
}

export const ArweaveEntries: EntryT[] = 
[
    {
        key: "1",
        id: "connect",
        icon: <PieChartOutlined />,
        title: "Connect to Arweave",
    },
    {
        key: "2",
        id: "wallet",
        icon: <PieChartOutlined />,
        title: "Create a Wallet",
    },
	{
		key: "3",
		id: "fund",
        icon: <PieChartOutlined />,
		title: "Fund the account with AR",
	},
]
/*
			{
				id: "balance",
				title: "Get the balance of the wallet",
				url: ""
			},
			{
				id: "transfer",
				title: "Transfer some AR",
				url: ""
			},
			{
				id: "submit",
				title: "Submit a data transaction",
				url: ""
			},
			{
				id: "deploy",
				title: "Deploy SmartWeave Contract",
				url: ""
			},
			{
				id: "call",
				title: "Interacting with SmartWeave",
				url: ""
			},
			{
				id: "retrieve",
				title: "Retrieve All post from an Address",
				url: ""
			},
		]
*/