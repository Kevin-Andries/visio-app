import { useCallback, useContext, useEffect, useRef, useState } from "react";
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
import { RTCConfig, peerConfig } from "../utils/rtc";
import { joinRoom } from "../api/api";
import { ContextState } from "../state/Provider";
import { joinRoomAction } from "../state/actions";

// TODO : generate TURN credentials
// TODO : use native wbesockets without any library
// TODO : use a message queue
// TODO : look at multer & hussein for native file upload

export class MyPeer {
  id: string;
  stream: MediaStream;
  connection: RTCPeerConnection;
  isCallAnswered: boolean;
  iceCandidates: RTCIceCandidate[];
  which: string;
  isDone: boolean;
  sdp: RTCSessionDescription | undefined;

  constructor(id: string, which: string, sdp?: RTCSessionDescription | undefined) {
    this.id = id;
    this.connection = new RTCPeerConnection(RTCConfig);
    this.iceCandidates = [];
    this.stream = new MediaStream();
    this.which = which;
    this.isDone = false;
    this.sdp = sdp;
  }

  setStream(stream: MediaStream) {
    this.stream = stream;
  }
  setConnection(connection: RTCPeerConnection) {
    this.connection = connection;
  }
  setIsCallAnswered(isCallAnswered: boolean) {
    this.isCallAnswered = isCallAnswered;
  }
  setIceCandidate(iceCandidate: RTCIceCandidate) {
    this.iceCandidates.push(iceCandidate);
  }
}

//************************************************************************************************************************

const Room = () => {
  const { state, dispatch }: any = useContext(ContextState);
  const [loading, setLoading] = useState(true);
  const [pc, setPc] = useState<MyPeer[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const history = useHistory();

  // useEffect(() => {
  //   console.log("PC CHANGED", pc);
  // }, [pc]);

  const handleHangup = useCallback((peer: MyPeer) => {
    peer.connection.onconnectionstatechange = () => {
      const connectionState = peer.connection.connectionState;

      if (connectionState === "closed" || connectionState === "disconnected") {
        // remove peer from pc list
        setPc((prev) => prev.filter((p) => p.id !== peer.id));
      } else if (connectionState === "connected") {
        console.log("%c CONNECTED TO A NEW PEER", "color: #42f6ff; font-size: 15px");
      }
    };
  }, []);

  const setTracks = useCallback(
    (peer: MyPeer) => {
      if (!state.media) return;

      // give local tracks to remote peer
      state.media.getTracks().forEach((track: MediaStreamTrack) => {
        peer.connection.addTrack(track, state.media);
      });

      // listen to tracks from remote peer
      peer.connection.ontrack = (e) => {
        e.streams[0].getTracks().forEach((track) => {
          peer.stream.addTrack(track);
        });
      };
    },
    [state.media]
  );

  const createPeer = useCallback((peerId: string, which: string, sdp?: RTCSessionDescription) => {
    const peer = new MyPeer(peerId, which, sdp);

    setPc((prev) => [...prev, peer]);

    return peer;
  }, []);

  const createRTCOffer = useCallback(
    async (peerId: string) => {
      /* const newPeer =  */ createPeer(peerId, "offer");
    },
    [createPeer]
  );

  const createRTCAnswer = useCallback(
    async (peerId: string, sdp: RTCSessionDescription) => {
      /* const newPeer =  */ createPeer(peerId, "answer", sdp);
    },
    [createPeer]
  );

  useEffect(() => {
    pc.forEach((p) => {
      if (p.isDone) return;

      if (p.which === "offer") {
        (async () => {
          const socket = socketRef.current as Socket;

          setTracks(p);
          handleHangup(p);

          p.connection.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
            if (e.candidate) {
              if (!p.isCallAnswered) {
                p.setIceCandidate(e.candidate);
              } else {
                socket.emit("ice-candidate", p.id, e.candidate);
              }
            }
          };

          const offer = await p.connection.createOffer(peerConfig);
          await p.connection.setLocalDescription(offer);

          socket.emit("offer", p.id, offer);
        })();
      } else {
        (async () => {
          setTracks(p);
          handleHangup(p);

          const socket = socketRef.current as Socket;

          p.connection.onicecandidate = (e) => {
            if (e.candidate) {
              socket.emit("ice-candidate", p.id, e.candidate);
            }
          };

          await p.connection.setRemoteDescription(p.sdp!);

          const answer = await p.connection.createAnswer(peerConfig);
          await p.connection.setLocalDescription(answer);

          socket.emit("answer", p.id, answer);
        })();
      }

      p.isDone = true;
    });
  }, [pc, handleHangup, setTracks]);

  //** Get roomId from url and ask to join room
  useEffect(() => {
    const roomIdFromURL = history.location.pathname.substring(1);

    if (state.username) {
      joinRoom(roomIdFromURL, state.username)
        .then((roomData) => {
          setLoading(false);
          dispatch(joinRoomAction(roomData));
        })
        .catch(() => history.push("/"));
    }
  }, [history.location.pathname, history, state.username, dispatch]);

  //** Initialize socket
  useEffect(() => {
    if (!state.roomId || state.loadingMedia) return;

    const socket = io(process.env.REACT_APP_API_URL as string);
    socketRef.current = socket;

    // When a client joined, we create an offer for him
    socket.on("new-peer-joined", async (peerId) => {
      createRTCOffer(peerId);
    });

    // When a SDP is received, we create an answer
    socket.on("sdp-offer", async (peerId, sdp) => {
      createRTCAnswer(peerId, sdp);
    });

    socket.on("sdp-answer", (peerId, sdp) => {
      setPc((prev) => {
        const remotePeer = prev.find((peer) => peer.id === peerId);
        remotePeer!.connection.setRemoteDescription(sdp);

        remotePeer!.isCallAnswered = true;

        remotePeer!.iceCandidates.forEach((candidate) => {
          socket.emit("ice-candidate", peerId, candidate);
        });

        return prev;
      });
    });

    socket.on("new-ice-candidate", (peerId, candidate) => {
      setPc((prev) => {
        const remotePeer = prev.find((peer) => peer.id === peerId);

        remotePeer!.connection.addIceCandidate(new RTCIceCandidate(candidate));
        return prev;
      });
    });

    socket.on("user-left", (peerId) => {
      // remove peer from pc list
      setPc((prev) => prev.filter((p) => p.id !== peerId));
    });

    console.log("%c JOIN ROOM", "color: #55ff69; font-size: 30px");
    socket.emit("join-room", state.roomId);

    return () => {
      setPc((prev) => {
        prev.forEach((peer) => peer.connection.close());
        return prev;
      });

      socket.emit("leaving", state.roomId);
      socket.close();
      console.log("%c LEFT ROOM", "color: #ff3067; font-size: 30px");
    };
  }, [state.roomId, state.loadingMedia, createRTCAnswer, createRTCOffer]);

  return loading ? (
    <p>Loading</p>
  ) : (
    <div className="h-screen flex flex-col justify-between ">
      <Header />
      <h2 className="text-center font-bold text-3xl">ROOM NAME</h2>
      {!state.username && <SetUsernameModal />}
      <div className="flex flex-col sm:flex-row h-full">
        <VideoStreamingSpace localStream={state.media} remotePeers={pc} />
        <Chat socket={socketRef.current} />
      </div>
      <MuteButton />
      <HideCameraButton />
      <Footer />
    </div>
  );
};

export default Room;
