import { ChainType, StepType } from "types"

// context stuff 
export type State = {
    host: string
    port: number
    index: number
    protocol: string
    address?: string
    wallet?: string
}

export type Action =
    | { type: 'SetWallet'; wallet: string | undefined }
    | { type: 'SetAddress'; address: string | undefined }
    | { type: 'SetDataId'; dataId: string | undefined }
    | { type: 'SetStateId'; stateId: string | undefined }
    | { type: 'SetIndex'; index: number }

// Components
export type AlertT = "success" | "info" | "warning" | "error" | undefined

export type EntryT = {
    msg: string
    display: (value: string) => string
    value: string
}

// components : Layout
export interface StepButtonsI {
    next(): void
    prev(): void
    isFirstStep: boolean
    isLastStep: boolean
}

export interface StepI {
    step: StepType
    isFirstStep: boolean
    isLastStep: boolean
    prev(): void
    next(): void
    body: JSX.Element
    nav?: JSX.Element
}

export interface SidebarI {
    steps: StepType[]
    stepIndex: number
}

export interface AppI {
    chain: ChainType
}
