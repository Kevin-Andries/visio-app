import { useRef, useEffect } from "react";

interface IProps {
  remoteStream: MediaStream;
}

const RemoteVideo = ({ remoteStream }: IProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef && videoRef.current) {
      videoRef.current.srcObject = remoteStream;
      console.log("Remote stream: ", remoteStream);
    }
  });

  return <video autoPlay playsInline ref={videoRef}></video>;
};

export default RemoteVideo;
