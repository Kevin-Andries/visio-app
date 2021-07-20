export const setMediaAction = (media: MediaStream) => ({
  type: "SET_MEDIA",
  payload: media,
});

export const setLoadingMediaAction = (isLoading: boolean) => ({
  type: "SET_LOADING_MEDIA",
  payload: isLoading,
});
