import { useState } from "react";

interface IProps {
  handleSetUsername: (username: string) => void;
  toggleSetUsername: () => void;
}

const EditUsername = ({ handleSetUsername, toggleSetUsername }: IProps) => {
  const [username, setUsername] = useState("");

  const handleChange = (e: any) => {
    setUsername(e.target.value);
  };

  const handleSubmit = () => {
    handleSetUsername(username);
  };
  return (
    <form onSubmit={handleSubmit}>
      <input required autoFocus type="text" className="border-2 -m-1" onChange={handleChange} />
      <span onClick={toggleSetUsername} className="cursor-pointer ml-3">
        &#x274C;
      </span>
    </form>
  );
};

export default EditUsername;
