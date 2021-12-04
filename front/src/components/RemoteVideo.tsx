import { useRef, useEffect } from "react";

interface IProps {
  remoteStream: MediaStream;
}

const RemoteVideo = ({ remoteStream }: IProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log("%c REMTOE STREAM:", "color: red");
    console.log(remoteStream);
  }, [remoteStream]);

  useEffect(() => {
    if (videoRef && videoRef.current) {
      videoRef.current.srcObject = remoteStream;
    }
  });

  return <video autoPlay playsInline ref={videoRef}></video>;
};

export default RemoteVideo;
