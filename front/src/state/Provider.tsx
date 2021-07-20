import { useReducer, createContext } from "react";

export interface IState {}

const initialState: IState = {};

const reducer = (state: IState, action: string) => {
  switch (action) {
    default:
      return state;
  }
};

export const ContextState = createContext<IState | undefined>(undefined);

interface IProps {
  children: React.ReactNode;
}

const ContextProvider = ({ children }: IProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = { state, dispatch };
  return <ContextState.Provider value={value}>{children}</ContextState.Provider>;
};

export default ContextProvider;
