import { useRef, useEffect } from "react";

interface IProps {
  remoteStream: MediaStream;
}

const RemoteVideo = ({ remoteStream }: IProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef && videoRef.current) {
      videoRef.current.srcObject = remoteStream;
    }
  });

  return <video className="videoBoxInside" autoPlay playsInline ref={videoRef}></video>;
};

export default RemoteVideo;
