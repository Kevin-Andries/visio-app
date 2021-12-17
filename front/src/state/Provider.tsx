import { useReducer, createContext } from "react";

export interface IState {
  media: MediaStream | null;
  loadingMedia: boolean;
  roomId: string;
  username: string;
  token: string;
}

const initialState: IState = {
  media: null,
  loadingMedia: true,
  roomId: "",
  username: "John Doe",
  // username: localStorage.getItem("username") || "",
  token: "",
};

interface IAction {
  type: string;
  payload: any;
}

function reducer(state: IState, action: IAction) {
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
        roomId: action.payload,
      };
    case "JOIN_ROOM":
      return {
        ...state,
        roomId: action.payload.roomId,
        token: action.payload.token,
      };
    case "SET_USER_NAME":
      localStorage.setItem("username", action.payload);
      return {
        ...state,
        username: action.payload,
      };
    case "RESET":
      return {
        ...initialState,
        media: state.media,
        loadingMedia: state.loadingMedia,
      };
    default:
      console.error("Action not found in reducer");
      return state;
  }
}

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
