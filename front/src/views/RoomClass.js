import { Component } from "react";
import { io } from "socket.io-client";
import { RTCConfig, peerConfig } from "../utils/rtc";
// Components
import Header from "../components/Header";
import Footer from "../components/Footer";
import VideoStreamingSpace from "../components/VideoStreamingSpace";
import Chat from "../components/Chat";
//import SetUsernameModal from "../components/SetUsernameModal";
import MuteButton from "../components/MuteButton";
import HideCameraButton from "../components/HideCameraButton";

export default class Room extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      localMedia: null,
      socket: null,
      pc: [],
      loading: true,
      roomId: "",
    };
  }

  /***************************************************************************/
  componentDidMount() {
    // request permission to use video/audio
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((res) =>
      this.setState(
        (prev) => ({
          ...prev,
          localMedia: res,
        }),
        () => {
          // extract room id from url
          const roomIdFromURL = window.location.hash.substring(2);

          this.setState((prev) => ({
            ...prev,
            roomId: roomIdFromURL,
          }));

          // connect to room socket
          const socket = io(`${process.env.REACT_APP_API_URL}`);
          this.setState(
            (prev) => ({ ...prev, socket }),
            () => this.initializeSocket()
          );
        }
      )
    );
  }

  /***************************************************************************/
  initializeSocket = () => {
    const socket = this.state.socket;
    console.log("INITIALIZE SOCKET");

    socket.on("connect", () => {
      console.log("Connected to socket " + socket.id);
    });

    // When a client joined, we create an offer for him
    socket.on("new-peer-joined", async (peerId) => {
      console.log("socket peer joined");
      this.createRTCConnection(peerId, "creates");
    });

    // When a SDP is received, we create an answer
    socket.on("sdp-offer", async (peerId, sdp) => {
      console.log("sdp-offer received", sdp);
      this.createRTCConnection(peerId, "answer", sdp);
    });

    socket.on("sdp-answer", (peerId, sdp) => {
      console.log("sdp-answer received");
      const remotePeer = this.state.pc.find((peer) => peer.id === peerId);
      remotePeer.connection.setRemoteDescription(sdp);
    });

    socket.on("new-ice-candidate", (peerId, candidate) => {
      console.log("received ice candidate");
      const remotePeer = this.state.pc.find((peer) => peer.id === peerId);
      remotePeer.connection.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.emit("join-room", this.state.roomId, () => {
      console.log("JOINED ROOM SOCKET");
    });

    // set loading to false
    this.setState((prev) => ({
      ...prev,
      loading: false,
    }));
  };

  /***************************************************************************/
  createRTCConnection = (peerId, which, sdp) => {
    const newPeer = { id: peerId, connection: new RTCPeerConnection(RTCConfig), stream: new MediaStream() };
    this.setState(
      (prev) => ({
        ...prev,
        pc: [...prev.pc, newPeer],
      }),
      async () => {
        const socket = this.state.socket;

        console.log("CREATE-RTC-CONNECTION", which, sdp);

        if (which === "creates") {
          // Give its tracks to remote peer
          // if (this.state.localMedia) {
          this.state.localMedia.getTracks().forEach((track) => {
            console.log("sending my tracks", track);
            newPeer.connection.addTrack(track, this.state.localMedia);
          });
          // }
        }

        if (which !== "creates") {
          // Listen to ice candidate
          newPeer.connection.onicecandidate = (e) => {
            if (e.candidate) {
              console.log("emit ice candidate");
              socket.emit("ice-candidate", peerId, e.candidate);
            }
          };
        }

        // Listen to tracks
        newPeer.connection.ontrack = (e) => {
          console.log("RECEIVED TRACK", e);
          console.log("SETTINGS REMOTE TRACKS", e.streams[0].getTracks());
          e.streams[0].getTracks().forEach((track) => {
            newPeer.stream.addTrack(track);
          });
        };

        newPeer.connection.onconnectionstatechange = () => {
          const connectionState = newPeer.connection.connectionState;
          if (connectionState === "closed" || connectionState === "disconnected") {
            console.log("A USER LEFT THE ROOM");

            // remove pc from pc list in state
            this.setState((prev) => ({
              ...prev,
              pc: prev.pc.filter((peer) => peer.id !== peerId),
            }));
          } else if (connectionState === "connected") {
            console.log("CONNECTED TO PEER");
          }
        };

        if (which === "creates") {
          console.log("creating...");

          newPeer.connection.onnegotiationneeded = async () => {
            // Creates offer and responds to other peer
            const offer = await newPeer.connection.createOffer(peerConfig);
            console.log("created...");
            await newPeer.connection.setLocalDescription(offer);

            // Listen to ice candidate
            newPeer.connection.onicecandidate = (e) => {
              if (e.candidate) {
                console.log("emit ice candidate");
                socket.emit("ice-candidate", peerId, e.candidate);
              }
            };

            console.log(offer); // 2x diff !!!
            console.log("emit offer");
            socket.emit("offer", peerId, offer);
          };
        } else if (which === "answer" && sdp) {
          const sdpObj = sdp;
          await newPeer.connection.setRemoteDescription(sdpObj);

          // if (this.state.localMedia) {
          this.state.localMedia.getTracks().forEach((track) => {
            console.log("sending my tracks", track);
            newPeer.connection.addTrack(track, this.state.localMedia);
          });
          // }

          const answer = await newPeer.connection.createAnswer(peerConfig);
          await newPeer.connection.setLocalDescription(answer);

          socket.emit("answer", peerId, answer);
          console.log("emit answer");
        }
      }
    );
  };

  /***************************************************************************/
  componentDidUpdate(prevProps, prevState) {
    console.log("STATE UPDATED:", this.state);
  }

  /***************************************************************************/
  componentWillUnmount() {
    if (this.state.socket) this.state.socket.close();
  }
  /******************************************************************************************************************/
  render() {
    return this.state.loading ? (
      <p>Loading</p>
    ) : (
      <div className="h-screen flex flex-col justify-between ">
        <Header />
        <h2 className="text-center font-bold text-3xl">ROOM NAME</h2>

        <div className="flex flex-col sm:flex-row" style={{ height: "90%" }}>
          <VideoStreamingSpace localStream={this.state.localMedia} remotePeers={this.state.pc} />
          <Chat socket={this.socket} />
        </div>
        <MuteButton />
        <HideCameraButton />
        <Footer />
      </div>
    );
  }
}
