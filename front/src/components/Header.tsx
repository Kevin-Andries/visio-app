import { Link } from "react-router-dom";

const Header = () => {
  return (
    <div className="p-2 px-4" style={{ height: "15vh", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <h1 className="font-medium text-xl ">Visio-app</h1>
      <Link to="/contact" className=" text-sm">
        Contact
      </Link>
    </div>
  );
};

export default Header;
