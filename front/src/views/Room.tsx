import { useEffect, useRef, useState, useContext, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useHistory } from "react-router-dom";
//import jwt from "jsonwebtoken";
// Components
import Header from "../components/Header";
import Footer from "../components/Footer";
import VideoStreamingSpace from "../components/VideoStreamingSpace";
import Chat from "../components/Chat";
import SetUsernameModal from "../components/SetUsernameModal";
// Misc
import { ContextState } from "../state/Provider";
import { joinRoomAction } from "../state/actions";
import { RTCConfig, peerConfig } from "../utils/rtc";

export interface IPeer {
  id: string;
  stream: MediaStream;
  connection: RTCPeerConnection;
}

// useReducer is great to avoid state dependency when we change the state.
// But if we need to read it not to change it, it is useless.

// When does socket.on("connect") fire exactly ???

const Room = () => {
  const { state, dispatch } = useContext<any>(ContextState);
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  //const [socket, setSocket] = useState<any>(null);
  const socketRef = useRef<Socket | undefined>();
  const [roomId] = useState(history.location.pathname.substring(1));
  const [, setPc] = useState<IPeer[]>([]);
  const [update, setUpdate] = useState(true);
  const pcRef = useRef<IPeer[]>([]);
  //const socketInitializedRef = useRef(false);

  const removeRemotePeer = (peerId: string) => {
    pcRef.current = pcRef.current.filter((peer: IPeer) => peer.id !== peerId);
    setPc(pcRef.current);
  };

  /*************************************************************************************************************************/
  /*************************************************************************************************************************/
  useEffect(() => {
    // check if room exists
    (async () => {
      let res: any = await fetch(`${process.env.REACT_APP_API_URL}/room/${roomId}`);

      if (res.status === 404) {
        console.log("%c THIS ROOM DOES NOT EXIST", "color: lightgreen; background: red; font-size: 20px");
        history.push("/");
      } else {
        //console.log("Data from token:", jwt.decode(await res.json()));
        res = await res.json();
        dispatch(joinRoomAction({ roomId: res.roomId, token: res.token }));
        console.log("%c WELCOME", "color: yellow; background: blue; font-size: 20px");
        setLoading(false);
      }
    })();
  }, [roomId, history, dispatch]);

  /*************************************************************************************************************************/
  /*************************************************************************************************************************/

  /* useEffect(() => {
    pcRef.current = pc;
  }); */

  /*************************************************************************************************************************/
  /*************************************************************************************************************************/

  useEffect(() => {
    return () => {
      // Close RTC connections here
      // But why aren't objects destroyed ????????
      // Or they are but connetions are still on in the browser ???
      console.log("CLOSING ALL CONNECTIONS");
      pcRef.current.forEach((pc) => pc.connection.close());
    };
  }, []);

  // Creates new RTC co when a client joins, and sends SDP to him
  const createRTCConnection = useCallback(
    async (peerId: string, which: string, sdp?: RTCSessionDescription): Promise<void> => {
      const newPeer = { id: peerId, connection: new RTCPeerConnection(RTCConfig), stream: new MediaStream() };

      // Listen to ice candidate
      newPeer.connection.onicecandidate = (e) => {
        if (e.candidate) {
          console.log("emit ice candidate");

          socketRef.current?.emit("ice-candidate", peerId, e.candidate);
        }
      };

      // Listen to tracks
      newPeer.connection.ontrack = (e) => {
        console.log("RECEIVED TRACK", e);

        /* setTimeout(() => { */
        console.log("SETTINGS REMOTE TRACKS", e.streams[0].getTracks());

        e.streams[0].getTracks().forEach((track: MediaStreamTrack) => {
          newPeer.stream.addTrack(track);
        });
        /* }, 2000); */
      };

      newPeer.connection.onconnectionstatechange = () => {
        const connectionState = newPeer.connection.connectionState;

        if (connectionState === "closed" || connectionState === "disconnected") {
          console.log("A USER LEFT THE ROOM");
          removeRemotePeer(newPeer.id);
        } else if (connectionState === "connected") {
          console.log("CONNECTED TO PEER");
        }
      };

      // Give its tracks to remote peer
      if (state.media) {
        state.media.getTracks().forEach((track: MediaStreamTrack) => {
          console.log("sending my tracks", track);
          newPeer.connection.addTrack(track, state.media);
        });
      }

      if (which === "creates") {
        // Creates offer and responds to other peer
        console.log("create offer");
        const offer = await newPeer.connection.createOffer(peerConfig);
        newPeer.connection.setLocalDescription(offer);
        socketRef.current?.emit("offer", peerId, offer);
      } else if (which === "answer" && sdp) {
        const sdpObj = new RTCSessionDescription(sdp);
        newPeer.connection.setRemoteDescription(sdpObj);
        const answer = await newPeer.connection.createAnswer(peerConfig);
        newPeer.connection.setLocalDescription(answer);
        console.log("create answer");
        socketRef.current?.emit("answer", peerId, answer);
      }

      // Save new peer conenction and re-render
      console.log("SETTING NEW PEER");
      pcRef.current.push(newPeer);
      //setPc((prev) => [...prev, newPeer]);
      setUpdate((prev) => !prev);
    },
    [state.media]
  );

  /*************************************************************************************************************************/
  /*************************************************************************************************************************/

  // When we join a room, we connect to socket
  // Before, we need username and be sure media is ready in state
  useEffect(() => {
    if (state.username && !state.loadingMedia) {
      //setSocket(io("http://localhost:3001"));
      socketRef.current = io(`${process.env.REACT_APP_API_URL}`);
      const socket = socketRef.current;

      socket.on("connect", () => {
        console.log("Connected to socket " + socket.id);
      });

      socket.emit("join-room", roomId, () => {
        // When an SDP is received, we create answer
        socket.on("sdp-offer", async (peerId: any, sdp: any) => {
          console.log("sdp-offer");
          createRTCConnection(peerId, "answer", sdp);
        });

        socket.on("sdp-answer", (peerId: any, sdp: any) => {
          console.log("sdp-answer");
          const remotePeer = pcRef.current.find((peer: IPeer) => peer.id === peerId);
          remotePeer?.connection.setRemoteDescription(new RTCSessionDescription(sdp));
        });

        // When a client joined, we create an offer for him
        socket.on("new-peer-joined", async (peerId: any) => {
          console.log("new peer joined");
          createRTCConnection(peerId, "creates");
        });

        socket.on("new-ice-candidate", (peerId: any, candidate: any) => {
          console.log("received ice candidate");
          const remotePeer = pcRef.current.find((peer: IPeer) => peer.id === peerId);
          remotePeer?.connection.addIceCandidate(new RTCIceCandidate(candidate));
        });

        socket.on("user-left", (peerId: string) => {
          console.error("USER LEFT");
          const remotePeerIndex = pcRef.current.findIndex((peer: IPeer) => peer.id === peerId);
          console.log(remotePeerIndex);
        });
      });

      return () => {
        socket.close();
      };
    }
  }, [state.username, state.loadingMedia, createRTCConnection, roomId, dispatch]);

  /*************************************************************************************************************************/
  /*************************************************************************************************************************/

  /*************************************************************************************************************************/
  /*************************************************************************************************************************/

  console.log("%c BEFORE RENDER", "color: yellow");
  console.log(pcRef.current);
  console.log("%c -------------------", "color: yellow");

  return loading ? (
    <p>Loading</p>
  ) : (
    <div className="h-screen flex flex-col justify-between ">
      <Header />
      <h2 className="text-center font-bold text-3xl">ROOM NAME</h2>
      {!state.username && <SetUsernameModal />}
      <div className="flex flex-col sm:flex-row" style={{ height: "90%" }}>
        <VideoStreamingSpace localStream={state.media} remotePeers={pcRef.current} update={update} />
        <Chat socket={socketRef.current!} />
      </div>
      <Footer />
    </div>
  );
};

export default Room;
