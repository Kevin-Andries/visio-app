import { useState, useEffect } from "react";
import { useRef } from "react";
import { v4 as uuid } from "uuid";
import styled from "styled-components";
// Components
import RemoteVideo from "./RemoteVideo";
// Misc
import { MyPeer } from "../views/Room";

interface IProps {
  localStream: MediaStream | null;
  remotePeers: MyPeer[];
  update?: Boolean;
}

const VideoStreamingSpace = ({ localStream, remotePeers }: IProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteBoxRef = useRef<HTMLDivElement>(null);

  const [xAxisNumberOfVideoBox, setXAxisNumberOfVideoBox] = useState(2);
  const [yAxisNumberOfVideoBox, setYAxisNumberOfVideoBox] = useState(2);
  const [videosWidth, setVideosWidth] = useState(0);
  const [videoHeight, setVideosHeight] = useState(0);
  const [numberOfPeers, setNumberOfPeers] = useState(0);

  useEffect(() => {
    setXandYAxisValues();
  }, [xAxisNumberOfVideoBox, yAxisNumberOfVideoBox, setXAxisNumberOfVideoBox, setYAxisNumberOfVideoBox]);

  useEffect(() => {
    window.addEventListener("resize", updateBoxesWidthAndHeight);
    updateBoxesWidthAndHeight();

    let currentNumberOfPeers = remotePeers.length;

    // We update the gris according the number of peers present in the video streaming space
    if (currentNumberOfPeers < numberOfPeers) {
      removeVideoBox();
    } else {
      addVideoBox();
    }
    setNumberOfPeers(currentNumberOfPeers);
  }, [localStream, remotePeers]);

  useEffect(() => {
    if (localVideoRef.current) {
      const tracks = localStream?.getTracks();
      if (tracks) {
        const newMedia = new MediaStream();
        newMedia.addTrack(tracks![1]);
        localVideoRef.current.srcObject = newMedia;
      }
    }
  });

  const setXandYAxisValues = () => {
    let boxes = document.querySelectorAll(".videoBox");

    if (boxes.length > xAxisNumberOfVideoBox * yAxisNumberOfVideoBox) {
      if (xAxisNumberOfVideoBox === yAxisNumberOfVideoBox) {
        setXAxisNumberOfVideoBox(xAxisNumberOfVideoBox + 1);
      }
      if (xAxisNumberOfVideoBox > yAxisNumberOfVideoBox) {
        setYAxisNumberOfVideoBox(yAxisNumberOfVideoBox + 1);
      }
    }

    updateBoxesWidthAndHeight();
  };

  // Add a video box, update X and Y value if needed
  const addVideoBox = () => {
    let boxes = document.querySelectorAll(".videoBox");

    if (boxes.length > xAxisNumberOfVideoBox * yAxisNumberOfVideoBox) {
      if (xAxisNumberOfVideoBox === yAxisNumberOfVideoBox) setXAxisNumberOfVideoBox(xAxisNumberOfVideoBox + 1);
      if (xAxisNumberOfVideoBox > yAxisNumberOfVideoBox) setYAxisNumberOfVideoBox(yAxisNumberOfVideoBox + 1);
    }

    updateBoxesWidthAndHeight();
  };

  // Add a video box, update X and Y value if needed
  const removeVideoBox = () => {
    let boxes = document.querySelectorAll(".videoBox");

    if (boxes.length <= 3) {
      updateBoxesWidthAndHeight();
      return;
    }

    if (xAxisNumberOfVideoBox === yAxisNumberOfVideoBox) {
      if (boxes.length <= xAxisNumberOfVideoBox * yAxisNumberOfVideoBox - xAxisNumberOfVideoBox) {
        setYAxisNumberOfVideoBox(yAxisNumberOfVideoBox - 1);
      }
    } else {
      if (boxes.length <= xAxisNumberOfVideoBox * yAxisNumberOfVideoBox - yAxisNumberOfVideoBox) {
        setXAxisNumberOfVideoBox(xAxisNumberOfVideoBox - 1);
      }
    }

    updateBoxesWidthAndHeight();
  };

  const updateBoxesWidthAndHeight = () => {
    let tabletMinus = 2;
    let mobileMinus = 3;

    if (window.innerWidth < 900 && window.innerWidth > 600) {
      setVideosWidth(100 / xAxisNumberOfVideoBox - tabletMinus);
      setVideosHeight(100 / yAxisNumberOfVideoBox - tabletMinus);
    } else if (window.innerWidth < 600) {
      setVideosWidth(100 / xAxisNumberOfVideoBox - mobileMinus);
      setVideosHeight(100 / yAxisNumberOfVideoBox - mobileMinus);
    } else {
      setVideosWidth(100 / xAxisNumberOfVideoBox - 0.6);
      setVideosHeight(100 / yAxisNumberOfVideoBox - 0.6);
    }
  };

  return (
    <StyledVideoSpace
      nb={remotePeers.length}
      parentHeight={remoteBoxRef.current?.clientHeight}
      className="rounded-xl ml-5 p-5 h-full w-full flex flex-col items-center border-2">
      <div id="videoContainer">
        <div className="videoBox" style={{ width: videosWidth + "%", height: videoHeight + "%" }}>
          <video autoPlay playsInline ref={localVideoRef} className="videoBoxInside"></video>
        </div>
        {remotePeers.map((peer: any, _i: any, _arr: any) => {
          return (
            <div className="videoBox" ref={remoteBoxRef} style={{ width: videosWidth + "%", height: videoHeight + "%" }}>
              <RemoteVideo key={uuid()} remoteStream={peer.stream} />
            </div>
          );
        })}
      </div>
    </StyledVideoSpace>
  );
};

const StyledVideoSpace = styled.div<{ nb: number; parentHeight: number | undefined }>`
  #videoContainer {
    height: 100%;
    width: 100%;
    padding: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
  }

  .videoBox {
    margin: 2px;
    max-height: 400px;
    max-width: 400px;
    display: flex;
    position: relative;
    padding: 2px;
    outline: green solid 3px;
  }

  .videoBoxInside {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }

  video {
    object-fit: cover;
    // border-radius: 10px;
  }

  .local-video-box {
    height: 25%;
    justify-content: center;

    & video {
      border: 2px solid salmon;
      padding: 0.2rem;
      height: 100%;
      width: 15rem;
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
