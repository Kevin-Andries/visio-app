import Header from "./components/header";

function App() {
  return (
    <div>
      <Header />
      <div style={{ height: "70vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <button className="text-blue-600 font-medium text-2xl" style={{ marginBottom: "10px" }}>
          Create a room
        </button>
        <button>Join a room</button>
      </div>
      <div style={{ height: "15vh" }}>All rights reserved</div>
    </div>
  );
}

export default App;
