import { useEffect } from "react";
import { useRef } from "react";

interface IProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}

const VideoStreamingSpace = ({ localStream, remoteStream }: IProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  });

  return (
    <div className="rounded-xl ml-5 text-center flex justify-center items-center bg-gray-300 h-full w-full">
      Videos will be displayed here.
      <video autoPlay ref={localVideoRef} style={{ height: "100px", width: "100px", zIndex: 999 }}></video>
      <video autoPlay ref={remoteVideoRef} style={{ height: "100px", width: "100px", zIndex: 999 }}></video>
    </div>
  );
};

export default VideoStreamingSpace;
