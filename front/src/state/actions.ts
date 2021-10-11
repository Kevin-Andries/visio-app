interface IJoinRoomPayload {
  roomId: string;
  token: string;
}

export const setMediaAction = (media: MediaStream) => ({
  type: "SET_MEDIA",
  payload: media,
});

export const setLoadingMediaAction = (isLoading: boolean) => ({
  type: "SET_LOADING_MEDIA",
  payload: isLoading,
});

export const createNewRoomAction = (roomId: number) => ({
  type: "CREATE_NEW_ROOM",
  payload: roomId,
});

export const setUserNameAction = (username: string) => ({
  type: "SET_USER_NAME",
  payload: username,
});

export const joinRoomAction = (payload: IJoinRoomPayload) => ({
  type: "JOIN_ROOM",
  payload,
});

export const resetAction = () => ({
  type: "RESET",
});
