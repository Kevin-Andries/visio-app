// Components
import Header from "../components/Header";

const Home = () => {
  return (
    <>
      <Header />
      <div style={{ height: "70vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <button className="text-white bg-blue-600 font-light text-2xl rounded-lg p-2 px-8 shadow-xl" style={{ marginBottom: "10px" }}>
          Create a room
        </button>
        <button className="text-blue-600 border-2 border-blue-600 rounded-lg p-2 px-4 shadow-xl mt-2">Join a room</button>
      </div>
    </>
  );
};

export default Home;
