import { joinRoomAction } from "../state/actions";

// join room socket for chat
export async function joinRoom(roomId: string, state: any, dispatch: any, history: any) {
  let res: any = await fetch(`${process.env.REACT_APP_API_URL}/room/${roomId}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ author: state.username }),
  });

  if (res.status === 404) {
    console.log("%c THIS ROOM DOES NOT EXIST", "color: lightgreen; background: red; font-size: 20px");
    throw new Error();
  } else {
    res = await res.json();
    dispatch(joinRoomAction({ roomId: res.roomId, token: res.token }));
    console.log("%c WELCOME", "color: yellow; background: blue; font-size: 20px");
    return res;
  }
}
