import { useEffect } from "react";
import { useRef } from "react";
import { v4 as uuid } from "uuid";
// Components
import RemoteVideo from "./RemoteVideo";
// Misc
import { IPeer } from "../views/Room";

interface IProps {
  localStream: MediaStream | null;
  remotePeers: IPeer[];
}

const VideoStreamingSpace = ({ localStream, remotePeers }: IProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  });

  return (
    <div className="rounded-xl ml-5 text-center flex justify-center items-center bg-gray-300 h-full w-full">
      Videos will be displayed here.
      <video autoPlay ref={localVideoRef} style={{ height: "100px", width: "100px", zIndex: 999 }}></video>
      {remotePeers.map((peer: IPeer) => (
        <RemoteVideo key={uuid()} remoteStream={peer.stream} />
      ))}
    </div>
  );
};

export default VideoStreamingSpace;
