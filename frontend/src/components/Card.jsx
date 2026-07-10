import React, { useContext } from "react";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const Card = ({ image }) => {
  const { selectedImage, setSelectedImage, setBackendImage, setFrontendImage } =
    useContext(userDataContext);
  const navigate = useNavigate();

  return (
    <div
      onClick={() => {
        setSelectedImage(image);
        setBackendImage(null);
        setFrontendImage(null);
      }}
      className={`w-[70px] h-[140px] sm:w-[150px] sm:h-[250px] bg-[#020220] border-2 border-[#0000ff66] rounded-2xl overflow-hidden cursor-pointer
      hover:border-4 hover:border-white
      ${selectedImage === image ? "border-4 border-white shadow-2xl shadow-blue-950" : ""}`}
    >
      <img src={image} alt="assistant" className="h-full w-full object-cover" />
    </div>
  );
};

export default Card;
