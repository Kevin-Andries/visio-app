// Components
import Header from "../components/Header";
import Footer from "../components/Footer";
import VideoStreamingSpace from "../components/VideoStreamingSpace";

const Room = () => {
  return (
    <div className="h-screen flex flex-col justify-between">
      <Header />
      <VideoStreamingSpace />
      <Footer />
    </div>
  );
};

export default Room;
