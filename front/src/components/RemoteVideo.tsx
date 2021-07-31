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

  return <video autoPlay ref={videoRef} style={{ height: "100px", width: "100px", zIndex: 999 }}></video>;
};

export default RemoteVideo;
