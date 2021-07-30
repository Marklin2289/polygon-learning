import { createContext, Dispatch } from 'react'

export type State = {
    host: string
    protocol: string
    port: number
    index: number
    network?: string
    address?: string
    wallet?: string
    dataId?: string
    stateId?: string
}

export type Action =
    | { type: 'SetWallet'; wallet: string | undefined }
    | { type: 'SetAddress'; address: string | undefined }
    | { type: 'SetNetwork'; network: string | undefined }
    | { type: 'SetDataId'; dataId: string | undefined }
    | { type: 'SetStateId'; stateId: string | undefined }
    | { type: 'SetIndex'; index: number }

export function appStateReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SetWallet':
      return { ...state, wallet: action.wallet }
    case 'SetNetwork':
      return { ...state, network: action.network }
    case 'SetAddress':
          return { ...state, address: action.address }
    case 'SetIndex':
          return { ...state, index: action.index }
    case 'SetDataId':
      return { ...state, dataId: action.dataId }
    case 'SetStateId':
      return { ...state, stateId: action.stateId }

    default:
      return state
  }
}

export const initialState = {
    host: 'localhost',
    port: 80,
    index: 0,
    protocol: 'http',
}

export const AppContext = createContext<{
    state: State
    dispatch: Dispatch<Action>
}>({
    state: initialState,
    dispatch: () => null,
})
