// join room socket for chat
export async function joinRoom(roomId: string, username: string) {
  let res: any = await fetch(`${process.env.REACT_APP_API_URL}/room/${roomId}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ author: username }),
  });

  if (res.status === 404) {
    console.log("%c THIS ROOM DOES NOT EXIST", "color: lightgreen; background: red; font-size: 20px");
    throw new Error();
  } else {
    res = await res.json();
    console.log("%c WELCOME TO THE ROOM", "color: yellow; background: blue; font-size: 20px");
    return { roomId: res.roomId, token: res.token };
  }
}
