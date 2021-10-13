export const RTCConfig = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

export const peerConfig = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};