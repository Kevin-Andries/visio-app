export const setMediaAction = (media: MediaStream) => ({
  type: "SET_MEDIA",
  payload: media,
});

export const setLoadingMediaAction = (isLoading: boolean) => ({
  type: "SET_LOADING_MEDIA",
  payload: isLoading,
});

export const createNewRoom = (roomId: number) => ({
  type: "CREATE_NEW_ROOM",
  payload: roomId,
});

export const setUserName = (userName: string) => ({
  type: "SET_USER_NAME",
  payload: userName,
});
