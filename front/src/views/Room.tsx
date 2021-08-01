import { useEffect, useRef, useState, useContext } from "react";
import { io } from "socket.io-client";
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

const Room = () => {
  const { state, dispatch } = useContext<any>(ContextState);
  const history = useHistory();
  const [socket, setSocket] = useState<any>();
  const [roomId] = useState(history.location.pathname.substring(1));
  const pcRef = useRef<IPeer[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [r, setR] = useState(false);

  // When we join a room, we connect to socket
  useEffect(() => {
    if (state.username) {
      setSocket(io("http://kevinandries.tech"));
    }
  }, [state.username]);

  useEffect(() => {
    // Creates new RTC co when a client joins, and sends SDP to him
    const createRTCConnection = async (peerId: string, which: string, sdp?: RTCSessionDescription): Promise<void> => {
      const newPeer = { id: peerId, connection: new RTCPeerConnection(RTCConfig), stream: new MediaStream() };

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
        e.streams[0].getTracks().forEach((track: MediaStreamTrack) => {
          newPeer.stream.addTrack(track);
        });
      };

      // Give its tracks to remote peer
      if (state.media) {
        state.media.getTracks().forEach((track: MediaStreamTrack) => {
          console.log("sending my tracks");
          newPeer.connection.addTrack(track, state.media);
        });
      }

      if (which === "creates") {
        // Creates offer and responds to other peer
        console.log("create offer");
        const offer = await newPeer.connection.createOffer(peerConfig);
        newPeer.connection.setLocalDescription(offer);
        socket.emit("offer", peerId, offer);
      } else if (which === "answer" && sdp) {
        const sdpObj = new RTCSessionDescription(sdp);
        newPeer.connection.setRemoteDescription(sdpObj);
        const answer = await newPeer.connection.createAnswer(peerConfig);
        newPeer.connection.setLocalDescription(answer);
        console.log("create answer");
        socket.emit("answer", peerId, answer);
      }

      // Save new peer conenction in ref
      pcRef.current.push(newPeer);
      setR((prev) => !prev);
    };

    if (state.username && socket) {
      socket.on("connect", () => {
        console.log("Connected to socket " + socket.id);

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
        });
      });
    }

    // Cleaning function, when component unmounts, we close socket connection
  }, [socket, dispatch, roomId, state.media, state.username]);

  return (
    <div className="h-screen flex flex-col justify-between ">
      <Header />
      <h2 className="text-center font-bold text-3xl">ROOM NAME</h2>
      {!state.username && <SetUsernameModal />}
      <div className="flex" style={{ height: "90%" }}>
        <VideoStreamingSpace localStream={state.media} remotePeers={pcRef.current} />
        <Chat socket={socket} />
      </div>
      <Footer />
    </div>
  );
};

export default Room;
