import { useEffect, useState, useContext } from "react";
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

const Room = () => {
  const { state, dispatch } = useContext<any>(ContextState);
  const history = useHistory();
  const [socketState, setSocket] = useState<any>();
  const [roomId] = useState(history.location.pathname.substring(1));
  //const [pc, setPc] = useState<RTCPeerConnection[]>([]);

  // When we join a room, we connect to socket
  useEffect(() => {
    let socket: Socket;
    const peerConnection = new RTCPeerConnection(RTCConfig);
    let channel: RTCDataChannel;

    if (state.username) {
      socket = io("http://localhost:3001");
      setSocket(socket);

      socket.on("connect", () => {
        console.log("Connected to socket " + socket.id);

        socket.emit("join-room", roomId, () => {
          dispatch(joinRoomAction(roomId));

          peerConnection.onicecandidate = (e) => {
            if (e.candidate) {
              console.log("EMITTING ICE");
              socket.emit("ice", roomId, e.candidate);
            }
          };

          socket.on("ice-transfer", (ice) => {
            console.log("received ice");
            const candidate = new RTCIceCandidate(ice);
            peerConnection.addIceCandidate(candidate);
          });

          socket.on("sdp-offer", (sdp) => {
            console.log("RECEIVED OFFER, CREATING ANSWER");

            peerConnection.ondatachannel = (e: any) => {
              e.channel.onopen = () => {
                console.log("channel open");
              };

              e.channel.onmessage = (msg: MessageEvent) => {
                console.log("MESSAGE ON DATA CHANNEL: ", msg.data);
                e.channel.send("Hello back");
              };
              //console.log("CHANNEL MSG", e);
            };

            const sdpObj = new RTCSessionDescription(sdp);
            peerConnection.setRemoteDescription(sdpObj);

            peerConnection.createAnswer(peerConfig).then((answer) => {
              peerConnection.setLocalDescription(answer);
              socket.emit("answer", roomId, answer);
            });
          });

          socket.on("sdp-answer", (sdp) => {
            console.log("RECEIVED ANSWER");
            const sdpObj = new RTCSessionDescription(sdp);
            peerConnection.setRemoteDescription(sdpObj);
          });

          // If user is not creator of room, he creates offer
          if (!state.hasCreatedRoom) {
            console.log("CREATING OFFER");
            channel = peerConnection.createDataChannel("channel");

            channel.addEventListener("message", (msg: MessageEvent) => console.log(msg.data));

            setTimeout(() => {
              //channel.send("Hello World");
              console.log("message sent");
            }, 1000);

            peerConnection.createOffer(peerConfig).then((offer) => {
              peerConnection.setLocalDescription(offer);
              socket.emit("offer", roomId, offer);
            });
          }
        });
      });
    }

    // Cleaning function, when component unmounts, we close socket connection
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [roomId, dispatch, state.username, state.hasCreatedRoom]);

  return (
    <div className="h-screen flex flex-col justify-between ">
      <Header />
      <h2 className="text-center font-bold text-3xl">ROOM NAME</h2>
      {!state.username && <SetUsernameModal />}
      <div className="flex" style={{ height: "90%" }}>
        <VideoStreamingSpace />
        <Chat socket={socketState} />
      </div>
      <Footer />
    </div>
  );
};

export default Room;
