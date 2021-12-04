import { useEffect, useContext, useReducer, Dispatch } from "react";
import { io, Socket } from "socket.io-client";
import { useHistory } from "react-router-dom";
//import jwt from "jsonwebtoken";
// Components
import Header from "../components/Header";
import Footer from "../components/Footer";
import VideoStreamingSpace from "../components/VideoStreamingSpace";
import Chat from "../components/Chat";
import SetUsernameModal from "../components/SetUsernameModal";
import MuteButton from "../components/MuteButton";
import HideCameraButton from "../components/HideCameraButton";
// Misc
import { ContextState } from "../state/Provider";
import { RTCConfig, peerConfig } from "../utils/rtc";
import { joinRoom } from "../api/api";

export interface IPeer {
  id: string;
  stream: MediaStream;
  connection: RTCPeerConnection;
}

interface IRoomState {
  socket: Socket | null;
  pc: IPeer[];
  loading: Boolean;
  roomId: string;
}

interface IAction {
  type: String;
  payload: any;
}

const initialState: IRoomState = {
  socket: null,
  pc: [],
  loading: true,
  roomId: "",
};

//************************************************************************************************************************
//************************************************************************************************************************

function generateRTCConnection(peerId: string): IPeer {
  return { id: peerId, connection: new RTCPeerConnection(RTCConfig), stream: new MediaStream() };
}

async function createRTCConnection(
  newPeer: IPeer,
  peerId: string,
  which: string,
  roomDispatch: Dispatch<any>,
  socket: Socket,
  media: MediaStream,
  sdp?: RTCSessionDescription
): Promise<void> {
  console.log("CREATE-RTC-CONNECTION", which, sdp);

  if (which === "creates") {
    console.log("creating...");

    // Creates offer and responds to other peer
    const offer = await newPeer.connection.createOffer(peerConfig);
    console.log("created...");
    await newPeer.connection.setLocalDescription(offer);

    console.log(offer); // 2x diff !!!
    console.log("emit offer");
    socket.emit("offer", peerId, offer);
  } else if (which === "answer" && sdp) {
    const sdpObj = new RTCSessionDescription(sdp);
    await newPeer.connection.setRemoteDescription(sdpObj);

    const answer = await newPeer.connection.createAnswer(peerConfig);
    await newPeer.connection.setLocalDescription(answer);

    console.log("emit answer");
    socket.emit("answer", peerId, answer);
  }

  // Listen to ice candidate
  newPeer.connection.onicecandidate = (e) => {
    if (e.candidate) {
      console.log("emit ice candidate");
      socket.emit("ice-candidate", peerId, e.candidate);
    }
  };

  // Listen to tracks
  newPeer.connection.ontrack = (e) => {
    console.log("RECEIVED TRACK", e);
    console.log("SETTINGS REMOTE TRACKS", e.streams[0].getTracks());
    e.streams[0].getTracks().forEach((track: MediaStreamTrack) => {
      newPeer.stream.addTrack(track);
    });
  };

  newPeer.connection.onconnectionstatechange = () => {
    const connectionState = newPeer.connection.connectionState;
    if (connectionState === "closed" || connectionState === "disconnected") {
      console.log("A USER LEFT THE ROOM");
      roomDispatch({ type: "REMOVE_RTC_CONNECTION", payload: newPeer.id });
    } else if (connectionState === "connected") {
      console.log("CONNECTED TO PEER");
    }
  };

  // Give its tracks to remote peer
  if (media) {
    media.getTracks().forEach((track: MediaStreamTrack) => {
      console.log("sending my tracks", track);
      newPeer.connection.addTrack(track, media);
    });
  }
}

//************************************************************************************************************************
//************************************************************************************************************************

function initializeSocket(socket: Socket, roomId: string, roomDispatch: Dispatch<any>) {
  console.log("INITIALIZE SOCKET");

  socket.on("connect", () => {
    console.log("Connected to socket " + socket.id);
  });

  // When a client joined, we create an offer for him
  socket.on("new-peer-joined", async (peerId: any) => {
    console.log("socket peer joined");
    roomDispatch({
      type: "NEW_PEER_JOINED",
      payload: {
        peerId,
        roomDispatch,
      },
    });
    //createRTCConnection(peerId, "creates", socket, roomDispatch);
  });

  // When a SDP is received, we create an answer
  socket.on("sdp-offer", async (peerId: any, sdp: any) => {
    console.log("sdp-offer received", sdp);
    roomDispatch({
      type: "SDP_OFFER",
      payload: {
        peerId,
        sdp,
        roomDispatch,
      },
    });
    //createRTCConnection(peerId, "answer", roomDispatch, sdp);
  });

  socket.on("sdp-answer", (peerId: any, sdp: any) => {
    console.log("sdp-answer received");
    roomDispatch({
      type: "SDP_ANSWER",
      payload: {
        peerId,
        sdp,
      },
    });
  });

  socket.on("new-ice-candidate", (peerId: any, candidate: any) => {
    console.log("received ice candidate");
    roomDispatch({
      type: "ADD_ICE_CANDIDATE",
      payload: {
        peerId,
        candidate,
      },
    });
  });

  socket.on("user-left", (_peerId: string) => {
    console.error("USER LEFT");
    /* const remotePeerIndex = pc.findIndex((peer: IPeer) => peer.id === peerId);
    console.log(remotePeerIndex); */
  });

  socket.emit("join-room", roomId, () => {
    console.log("JOINED ROOM SOCKET");
  });
}

//************************************************************************************************************************
//************************************************************************************************************************

function reducer(state: any, action: IAction) {
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    case "SET_ROOM_ID":
      return {
        ...state,
        roomId: action.payload,
        loading: false,
      };
    case "SET_SOCKET":
      return {
        ...state,
        socket: action.payload,
      };
    case "SAVE_NEW_PEER":
      console.log("SAVE_NEW_PEER");
      return {
        ...state,
        pc: [...state.pc, action.payload],
      };
    case "ADD_ICE_CANDIDATE": {
      console.log("ADD_ICE_CANDIDATE");
      const remotePeer = state.pc.find((peer: IPeer) => peer.id === action.payload.peerId);
      remotePeer?.connection.addIceCandidate(new RTCIceCandidate(action.payload.candidate));
      return state;
    }
    case "NEW_PEER_JOINED": {
      console.log("NEW_PEER_JOINED");
      const newPeer = generateRTCConnection(action.payload.peerId);
      createRTCConnection(newPeer, action.payload.peerId, "creates", action.payload.roomDispatch, state.socket, state.media);
      return {
        ...state,
        pc: [...state.pc, newPeer],
      };
    }
    case "SDP_OFFER": {
      console.log("SDP_OFFER");
      const newPeer = generateRTCConnection(action.payload.peerId);
      createRTCConnection(
        newPeer,
        action.payload.peerId,
        "answer",
        action.payload.roomDispatch,
        state.socket,
        state.media,
        action.payload.sdp
      );
      return {
        ...state,
        pc: [...state.pc, newPeer],
      };
    }
    case "SDP_ANSWER": {
      console.log("SDP_ANSWER");
      const remotePeer = state.pc.find((peer: IPeer) => peer.id === action.payload.peerId);
      console.log("remote peer", remotePeer);
      remotePeer?.connection.setRemoteDescription(new RTCSessionDescription(action.payload.sdp));
      return state;
    }
    case "REMOVE_RTC_CONNECTION":
      console.log("REMOVE_RTC_CONNECTION");
      return {
        ...state,
        pc: state.pc.filter((peer: IPeer) => peer.id !== action.payload),
      };
    default:
      return state;
  }
}

const Room = () => {
  const { state, dispatch } = useContext<any>(ContextState);
  const [{ roomId, socket, pc, loading }, roomDispatch] = useReducer(reducer, initialState);

  const history = useHistory();

  //** get roomId from url and ask to join room
  useEffect(() => {
    const roomIdFromURL = history.location.pathname.substring(1);
    roomDispatch({ type: "SET_ROOM_ID", payload: roomIdFromURL });

    if (state.username && !state.token) {
      joinRoom(roomIdFromURL, state, dispatch, history)
        .then(() => roomDispatch({ type: "SET_LOADING", payload: false }))
        .catch(() => history.push("/"));
    }
  }, [dispatch, history.location.pathname, state, history]);

  //** connect to room socket
  useEffect(() => {
    if (!socket && state.username && !state.loadingMedia) {
      const socket = io(`${process.env.REACT_APP_API_URL}`);
      roomDispatch({ type: "SET_SOCKET", payload: socket });
      initializeSocket(socket, state.roomId, roomDispatch);
    }
  }, [dispatch, state.loadingMedia, state.username, socket, roomId, state]);

  //** disconnect from room socket
  useEffect(
    () => () => {
      console.log("CLOSING SOCKET");
      if (socket) socket.close();
    },
    [socket]
  );

  //const [loading, setLoading] = useState(true);
  //const [socket, setSocket] = useState<any>(null);
  //const socketRef = useRef<Socket | undefined>();
  //const [roomId] = useState(history.location.pathname.substring(1));
  //const [pc, setPc] = useState<IPeer[]>([]);
  //const pcRef = useRef<IPeer[]>([]);
  //const socketInitializedRef = useRef(false);
  //const [update, setUpdate] = useState(true);

  /*************************************************************************************************************************/
  /*************************************************************************************************************************/

  /*************************************************************************************************************************/
  /*************************************************************************************************************************/

  /* useEffect(() => {
    pcRef.current = pc;
  }); */

  /* useEffect(() => {
    console.log("SOCKET UPDATED", socket);
  }, [socket]); */

  /*************************************************************************************************************************/
  /*************************************************************************************************************************/

  /* useEffect(() => {
    return () => {
      // Close RTC connections here
      // But why aren't objects destroyed ????????
      // Or they are but connetions are still on in the browser ???
      console.log("CLOSING PEERS CONNECTIONS");
      pc.forEach((pc: IPeer) => pc.connection.close());
    };
  }, []); */

  /*************************************************************************************************************************/
  /*************************************************************************************************************************/

  // When we join a room, we connect to socket
  // Before, we need username and be sure media is ready in state

  /*************************************************************************************************************************/
  /*************************************************************************************************************************/

  /* console.log("%c BEFORE RENDER", "color: yellow");
  console.log(pcRef.current);
  console.log("%c -------------------", "color: yellow"); */

  return loading && !state.token ? (
    <p>Loading</p>
  ) : (
    <div className="h-screen flex flex-col justify-between ">
      <Header />
      <h2 className="text-center font-bold text-3xl">ROOM NAME</h2>
      {!state.username && <SetUsernameModal />}
      <div className="flex flex-col sm:flex-row" style={{ height: "90%" }}>
        <VideoStreamingSpace localStream={state.media} remotePeers={pc} />
        <Chat socket={socket} />
      </div>
      <MuteButton />
      <HideCameraButton />
      <Footer />
    </div>
  );
};

export default Room;

// const createRTCConnection = async (peerId: string, which: string, sdp?: RTCSessionDescription): Promise<void> => {
//   const newPeer = { id: peerId, connection: new RTCPeerConnection(RTCConfig), stream: new MediaStream() };

//   /* console.log("IN FUNCTION", socket); */

//   // Listen to ice candidate
//   newPeer.connection.onicecandidate = (e) => {
//     if (e.candidate) {
//       console.log("emit ice candidate");

//       socket.emit("ice-candidate", peerId, e.candidate);
//     }
//   };

//   // Listen to tracks
//   newPeer.connection.ontrack = (e) => {
//     console.log("RECEIVED TRACK", e);

//     /* setTimeout(() => { */
//     console.log("SETTINGS REMOTE TRACKS", e.streams[0].getTracks());

//     e.streams[0].getTracks().forEach((track: MediaStreamTrack) => {
//       newPeer.stream.addTrack(track);
//     });
//     /* }, 2000); */
//   };

//   newPeer.connection.onconnectionstatechange = () => {
//     const connectionState = newPeer.connection.connectionState;

//     if (connectionState === "closed" || connectionState === "disconnected") {
//       console.log("A USER LEFT THE ROOM");
//       removeRemotePeer(newPeer.id);
//     } else if (connectionState === "connected") {
//       console.log("CONNECTED TO PEER");
//     }
//   };

//   // Give its tracks to remote peer
//   if (state.media) {
//     state.media.getTracks().forEach((track: MediaStreamTrack) => {
//       console.log("sending my tracks", track);
//       newPeer.connection.addTrack(track, state.media);
//     });
//   }

//   if (which === "creates") {
//     // Creates offer and responds to other peer
//     console.log("create offer");
//     const offer = await newPeer.connection.createOffer(peerConfig);
//     newPeer.connection.setLocalDescription(offer);
//     socket.emit("offer", peerId, offer);
//   } else if (which === "answer" && sdp) {
//     const sdpObj = new RTCSessionDescription(sdp);
//     newPeer.connection.setRemoteDescription(sdpObj);
//     const answer = await newPeer.connection.createAnswer(peerConfig);
//     newPeer.connection.setLocalDescription(answer);
//     console.log("create answer");
//     socket.emit("answer", peerId, answer);
//   }

//   // Save new peer conenction and re-render
//   console.log("SETTING NEW PEER");
//   setPc((prev) => [...prev, newPeer]);
//   setUpdate((prev) => !prev);
// };
