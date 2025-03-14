import React, { createContext, Dispatch, PropsWithChildren, useContext, useReducer } from 'react'

import { State } from '../types/state'
import { generateRandomWalletName } from '../utils/helpers'

import _defaultReducer, { ReducerAction } from './reducers/store'

type Reducer = <S extends State>(state: S, action: ReducerAction<unknown>) => S

interface StoreProviderProps {
  initialState?: State
  reducer?: Reducer
}

export const defaultState: State = {
  onboarding: {
    didAgreeToTerms: false,
    didCompleteTutorial: false,
    didCreatePIN: false,
    didConsiderBiometry: false,
    didNameWallet: false,
  },
  authentication: {
    didAuthenticate: false,
  },
  loginAttempt: {
    loginAttempts: 0,
    servedPenalty: true,
  },
  lockout: {
    displayNotification: false,
  },
  preferences: {
    developerModeEnabled: false,
    biometryPreferencesUpdated: false,
    useBiometry: false,
    useVerifierCapability: true,
    useConnectionInviterCapability: false,
    useDevVerifierTemplates: false,
    walletName: generateRandomWalletName(),
    useDataRetention: true,
    useHistoryCapability: true,
  },
  tours: {
    seenToursPrompt: false,
    enableTours: true,
    seenHomeTour: false,
  },
  deepLink: {
    activeDeepLink: '',
  },
  loading: false,
}

export const StoreContext = createContext<[State, Dispatch<ReducerAction<any>>]>([
  defaultState,
  () => {
    return
  },
])

export const mergeReducers = (a: Reducer, b: Reducer): Reducer => {
  return <S extends State>(state: S, action: ReducerAction<any>): S => {
    return a(b(state, action), action)
  }
}

export const defaultReducer = _defaultReducer

export const StoreProvider: React.FC<PropsWithChildren<StoreProviderProps>> = ({ children, initialState, reducer }) => {
  const _reducer = reducer ?? defaultReducer
  const _state = initialState ?? defaultState
  const [state, dispatch] = useReducer(_reducer, _state)

  return <StoreContext.Provider value={[state, dispatch]}>{children}</StoreContext.Provider>
}

export const useStore = <S extends State>(): [S, Dispatch<ReducerAction<any>>] => {
  const context = useContext(StoreContext)

  return context as unknown as [S, Dispatch<ReducerAction<any>>]
}
