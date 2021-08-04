import { useEffect } from "react";
import { useRef } from "react";
import { v4 as uuid } from "uuid";
import styled from "styled-components";
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
  const remoteBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  });

  return (
    <StyledVideoSpace
      nb={remotePeers.length}
      parentHeight={remoteBoxRef.current?.clientHeight}
      className="rounded-xl ml-5 p-5 h-full w-full flex flex-col items-center border-2">
      <div className="local-video-box mb-3">
        <video autoPlay ref={localVideoRef}></video>
      </div>
      <div className="remote-videos-box" ref={remoteBoxRef}>
        {remotePeers
          /* .filter((peer: IPeer) => peer.stream.getTracks().length > 0) */
          .map((peer: IPeer, i: any, arr: any) => {
            console.log("REMAINING ARRAY", arr);
            return <RemoteVideo key={uuid()} remoteStream={peer.stream} />;
          })}
      </div>
    </StyledVideoSpace>
  );
};

const StyledVideoSpace = styled.div<{ nb: number; parentHeight: number | undefined }>`
  video {
    object-fit: cover;
    border-radius: 10px;
  }

  .local-video-box {
    height: 25%;
    width: 15rem;

    & video {
      border: 2px solid salmon;
      padding: 0.2rem;
      height: 100%;
      width: 100%;
    }
  }

  .remote-videos-box {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 1rem;
    overflow: hidden;

    & video {
      height: 100%;
      max-height: ${(props) => (props.parentHeight ? `${props.parentHeight}px` : "")};
    }
  }
`;

export default VideoStreamingSpace;
