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
  componentDidMount() {}

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
