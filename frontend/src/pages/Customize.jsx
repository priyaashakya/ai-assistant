import React, { useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { userDataContext } from "../context/UserContext";
import Card from "../components/Card";

import { RiImageAddLine } from "react-icons/ri";

// Placeholder assistant avatar set — swap these with your own uploaded images
import image1 from "../assets/image1.png";
import image2 from "../assets/image2.jpg";
import image3 from "../assets/image4.png";
import image4 from "../assets/authBg.png";
import image5 from "../assets/image6.jpeg";
import image6 from "../assets/image7.jpeg";

const Customize = () => {
  const {
    frontendImage,
    setFrontendImage,
    backendImage,
    setBackendImage,
    selectedImage,
  } = useContext(userDataContext);

  const navigate = useNavigate();
  const inputImage = useRef();

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackendImage(file);
      setFrontendImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="w-full min-h-[100vh] bg-gradient-to-t from-black to-[#02023d] flex flex-col justify-center items-center gap-6 py-10">
      <h1 className="text-white text-2xl sm:text-3xl text-center px-4">
        Select your <span className="text-blue-400">Assistant Image</span>
      </h1>

      <div className="w-full max-w-[900px] flex justify-center items-center flex-wrap gap-4 px-4">
        <Card image={image1} />
        <Card image={image2} />
        <Card image={image3} />
        <Card image={image4} />
        <Card image={image5} />
        <Card image={image6} />

        <div
          onClick={() => inputImage.current.click()}
          className={`w-[70px] h-[140px] sm:w-[150px] sm:h-[250px] bg-[#020220] border-2 border-[#0000ff66] rounded-2xl overflow-hidden flex justify-center items-center cursor-pointer hover:border-4 hover:border-white
          ${frontendImage ? "border-4 border-white" : ""}`}
        >
          {frontendImage ? (
            <img
              src={frontendImage}
              className="h-full w-full object-cover"
              alt="custom"
            />
          ) : (
            <RiImageAddLine className="text-white" size={30} />
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          ref={inputImage}
          hidden
          onChange={handleImage}
        />
      </div>

      {(selectedImage || frontendImage) && (
        <button
          onClick={() => navigate("/customize2")}
          className="min-w-[150px] h-[60px] bg-white rounded-full text-black font-semibold text-lg mt-6"
        >
          Next
        </button>
      )}
    </div>
  );
};

export default Customize;
