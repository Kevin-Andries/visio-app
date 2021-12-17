export const RTCConfig = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302"],
    },
    {
      urls: "turn:numb.viagenie.ca:3478",
      username: "kevin.andries@yahoo.fr",
      credential: "azerty",
    },
  ],
  iceCandidatePoolSize: 10,
};

export const peerConfig = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};
