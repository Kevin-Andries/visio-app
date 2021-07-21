import { useReducer, createContext } from "react";

export interface IState {
  media: MediaStream | null;
  loadingMedia: boolean;
  activeRooms: string[];
}

const initialState: IState = {
  media: null,
  loadingMedia: true,
  activeRooms: [],
};

interface IPayload {
  type: string;
  payload: any;
}

const reducer = (state: IState, action: IPayload) => {
  switch (action.type) {
    case "SET_MEDIA":
      return {
        ...state,
        media: action.payload,
      };
    case "SET_LOADING_MEDIA":
      return {
        ...state,
        loadingMedia: action.payload,
      };
    case "CREATE_NEW_ROOM":
      return {
        ...state,
        activeRooms: [...state.activeRooms, action.payload],
      };
    default:
      console.error("Action not found in reducer");
      return state;
  }
};

export const ContextState = createContext<IState | undefined>(undefined);

interface IProps {
  children: React.ReactNode;
}

const ContextProvider = ({ children }: IProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value: any = { state, dispatch };

  return <ContextState.Provider value={value}>{children}</ContextState.Provider>;
};

export default ContextProvider;
