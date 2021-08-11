import React from 'react';
import { Layout, Menu } from 'antd';
import { ArweaveLogo } from './arweave-icon'
import { ArweaveEntries } from './arweave-entries'
import { useState, useContext } from 'react';
import { createContext, Dispatch, useReducer } from 'react'
import Icon from '@ant-design/icons';

const { Header, Content, Footer, Sider } = Layout;

export type State = {
    index: number
}

export type Action =
    | { type: 'SetIndex'; index: number }

export function appStateReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SetIndex':
          return { ...state, index: action.index }
    default:
      return state
  }
}

export const initialState = {
    index: 1,
}

const AppContext = createContext<{
    state: State
    dispatch: Dispatch<Action>
}>({
    state: initialState,
    dispatch: () => null,
})

const useAppState = () => useContext(AppContext)
  
const Step1 = () => <div>Step 1</div>
const Step2 = () => <div>Step 2</div>
const Step3 = () => <div>Step 3</div>

const ContentC = () => {
    const { state, dispatch } = useAppState();
    const nextHandler = () => {
		console.log('next', state.index)
        dispatch({
            type: 'SetIndex',
            index: state.index + 1
        })
    }
    const prevHandler = () => {
		console.log('prev')
        dispatch({
            type: 'SetIndex',
            index: state.index - 1
        })
    }
	return (
	<div className="site-layout-background" style={{ padding: 24, minHeight: '82vh', background: 'white' }}>
		<button onClick={prevHandler}>Prev</button>
		<button onClick={nextHandler}>Next</button>
		{ state.index === 1 && <Step1 /> }
		{ state.index === 2 && <Step2 /> }
		{ state.index === 3 && <Step3 /> }
	</div>
	)
}

const HeartSvg = () => (
	<svg width="1em" height="1em" fill="currentColor" viewBox="0 0 1024 1024">
	  <path d="M923 283.6c-13.4-31.1-32.6-58.9-56.9-82.8-24.3-23.8-52.5-42.4-84-55.5-32.5-13.5-66.9-20.3-102.4-20.3-49.3 0-97.4 13.5-139.2 39-10 6.1-19.5 12.8-28.5 20.1-9-7.3-18.5-14-28.5-20.1-41.8-25.5-89.9-39-139.2-39-35.5 0-69.9 6.8-102.4 20.3-31.4 13-59.7 31.7-84 55.5-24.4 23.9-43.5 51.7-56.9 82.8-13.9 32.3-21 66.6-21 101.9 0 33.3 6.8 68 20.3 103.3 11.3 29.5 27.5 60.1 48.2 91 32.8 48.9 77.9 99.9 133.9 151.6 92.8 85.7 184.7 144.9 188.6 147.3l23.7 15.2c10.5 6.7 24 6.7 34.5 0l23.7-15.2c3.9-2.5 95.7-61.6 188.6-147.3 56-51.7 101.1-102.7 133.9-151.6 20.7-30.9 37-61.5 48.2-91 13.5-35.3 20.3-70 20.3-103.3 0.1-35.3-7-69.6-20.9-101.9z" />
	</svg>
);

const HeartIcon = (props: any) => <Icon component={HeartSvg} {...props} />;

const AppLayout = () => {
	const { state } = useAppState();
	const [collapsed, setCollapsed] = useState(false);

    return (
		<Layout style={{ minHeight: '100vh' }}>
		  <Sider 
		  	collapsible 
			collapsed={collapsed} 
			onCollapse={() => setCollapsed(!collapsed)} 
			width={'250px'} 
			theme="dark"
		>
			<ArweaveLogo color={"khaki"}/>
			<Menu theme="dark" defaultSelectedKeys={[state.index.toString()]} mode="inline" selectedKeys={[state.index.toString()]}>
				{ArweaveEntries.map( entry => 
					<Menu.Item 
						key={entry.key} 
						icon={entry.icon}
						style={{color: 'khaki', fontWeight: 'bold'}}
					>
						{entry.title}
					</Menu.Item>)}
			</Menu>
		  </Sider>
		  <Layout className="site-layout">
			<Header className="site-layout-background" style={{ padding: 0 }} />
			<Content style={{ margin: '0 16px' }}>
				<ContentC />
			</Content>
			<Footer style={{ textAlign: 'center' }}>
				<span>Made with </span>     
				<HeartIcon style={{ color: 'hotpink' }} />
				<span> by figment learn </span>     
			</Footer>
		  </Layout>
		</Layout>
	);
}

const App = () => {
    const [state, dispatch] = useReducer(appStateReducer, initialState)

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            <AppLayout />
        </AppContext.Provider>
    )
}

export default App
