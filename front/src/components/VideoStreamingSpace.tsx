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
    <div className="rounded-xl ml-5 p-5 bg-gray-300 h-full w-full flex flex-col items-center">
      <div className="local-video-box mb-3">
        <video autoPlay ref={localVideoRef}></video>
      </div>
      <div className="remote-videos-box">
        {remotePeers
          .filter((peer: IPeer) => peer.stream.getTracks().length > 0)
          .map((peer: IPeer) => (
            <RemoteVideo key={uuid()} remoteStream={peer.stream} />
          ))}
      </div>
    </div>
  );
};

export default VideoStreamingSpace;
