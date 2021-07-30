import { Row } from 'antd';
import { useEffect, useReducer } from "react";

import { Connect, Wallet, Fund, Balance, Transfer, Deploy, Call, Submit, Retrieve } from '@arweave/components/Steps';
import { useAppState, useLocalStorage } from '@arweave/hooks'
import { initialState, appStateReducer, AppContext } from '@arweave/context'
import { Sidebar, Step } from '@arweave/components/Layout'
import Nav from '@arweave/components/Nav';

import type { AppI } from '@arweave/types';

const ArweaveApp: React.FC<AppI> = ({ chain }) => {
    const { state, dispatch } = useAppState();
    const { steps } = chain
    const step = steps[state.index];
    const nextHandler = () => {
        dispatch({
            type: 'SetIndex',
            index: state.index + 1
        })
    }
    const prevHandler = () => {
        dispatch({
            type: 'SetIndex',
            index: state.index - 1
        })
    }
    const isFirstStep = state.index == 0;
    const isLastStep = state.index === steps.length - 1;

    return (
        <Row>
        <Sidebar
            steps={steps}
            stepIndex={state.index}
        />
        <Step
            step={step}
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            prev={prevHandler}
            next={nextHandler}
            body={
            <>
                { step.id === "connect"   && <Connect  /> }
                { step.id === "wallet"    && <Wallet   /> }
                { step.id === "fund"      && <Fund     /> }
                { step.id === "balance"   && <Balance  /> }
                { step.id === "transfer"  && <Transfer /> }
                { step.id === "submit"    && <Submit   /> }
                { step.id === "deploy"    && <Deploy   /> }
                { step.id === "call"      && <Call     /> }
                { step.id === "retrieve"  && <Retrieve /> }
            </>
            }
            nav={<Nav />}
        />
        </Row>
  );
}

const Arweave: React.FC<AppI> = ({ chain }) => {
    const [storageState, setStorageState] = useLocalStorage(
        'arweave',
        initialState
    )
    const [state, dispatch] = useReducer(appStateReducer, storageState)
    useEffect(() => {
        setStorageState(state)
    }, [state, setStorageState])
    return (
        <AppContext.Provider value={{ state, dispatch }}>
            <ArweaveApp chain={chain} />
        </AppContext.Provider>
    )
}

export default Arweave
