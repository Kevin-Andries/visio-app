import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="p-2 px-4 flex justify-between items-end">
      <Link to="/contact" className="text-sm text-grey">
        All rights reserved
      </Link>
    </div>
  );
};

export default Footer;
