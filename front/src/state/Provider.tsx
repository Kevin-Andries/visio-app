import { useReducer, createContext } from "react";

export interface IState {
  media: MediaStream | null;
  loadingMedia: boolean;
  activeRooms: string[];
  roomId: string;
  hasCreatedRoom: boolean;
  username: string;
}

const initialState: IState = {
  media: null,
  loadingMedia: true,
  activeRooms: [],
  roomId: "",
  hasCreatedRoom: false,
  username: "",
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
        roomId: action.payload,
        hasCreatedRoom: true,
      };
    case "JOIN_ROOM":
      return {
        ...state,
        roomId: action.payload,
      };
    case "SET_USER_NAME":
      localStorage.setItem("username", action.payload);
      return {
        ...state,
        username: action.payload,
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
