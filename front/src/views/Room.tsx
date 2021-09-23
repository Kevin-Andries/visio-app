import { useEffect, useRef, useState, useContext } from "react";
import { io, Socket } from "socket.io-client";
import { useHistory } from "react-router-dom";
// Components
import Header from "../components/Header";
import Footer from "../components/Footer";
import VideoStreamingSpace from "../components/VideoStreamingSpace";
import Chat from "../components/Chat";
import SetUsernameModal from "../components/SetUsernameModal";
// Misc
import { ContextState } from "../state/Provider";
import { joinRoomAction } from "../state/actions";
import { useCallback } from "react";

const RTCConfig = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

const peerConfig = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};
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
  //const [socket, setSocket] = useState<any>(null);
  const socketRef = useRef<Socket | undefined>();
  const [roomId] = useState(history.location.pathname.substring(1));
  const [pc, setPc] = useState<IPeer[]>([]);
  const pcRef = useRef<IPeer[]>([]);
  //const socketInitializedRef = useRef(false);

  const removeRemotePeer = (peerId: string) => {
    pcRef.current = pcRef.current.filter((peer: IPeer) => peer.id !== peerId);
    setPc(pcRef.current);
  };

  /*************************************************************************************************************************/
  /*************************************************************************************************************************/

  useEffect(() => {
    pcRef.current = pc;
  });

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

        e.streams[0].getTracks().forEach((track: MediaStreamTrack) => {
          newPeer.stream.addTrack(track);
        });
      };

      newPeer.connection.onconnectionstatechange = () => {
        const connectionState = newPeer.connection.connectionState;
        if (connectionState === "closed" || connectionState === "disconnected") {
          console.log("A USER LEFT THE ROOM");
          removeRemotePeer(newPeer.id);
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
      setPc((prev) => [...prev, newPeer]);
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
        dispatch(joinRoomAction(roomId));

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

  return (
    <div className="h-screen flex flex-col justify-between ">
      <Header />
      <h2 className="text-center font-bold text-3xl">ROOM NAME</h2>
      {!state.username && <SetUsernameModal />}
      <div className="flex flex-col sm:flex-row" style={{ height: "90%" }}>
        <VideoStreamingSpace localStream={state.media} remotePeers={pc} />
        <Chat socket={socketRef.current!} />
      </div>
      <Footer />
    </div>
  );
};

export default Room;
