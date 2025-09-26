import React, { useState } from "react";
import stars from "../../assets/spark.svg";
import { useNavigate } from "react-router-dom";
import axios from "axios";

let apiUrl =
  import.meta.env.VITE_NODE_ENV === "production"
    ? import.meta.env.VITE_API_BASE_URL
    : "http://localhost:5000";

const LoginPage = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();
  const selectRole = (role) => setSelectedRole(role);

  const continueToPoll = async () => {
    if (selectedRole === "teacher") {
      try {
        const response = await axios.post(`${apiUrl}/teacher-login`);
        sessionStorage.setItem("username", response.data.username);
        navigate("/teacher-home-page");
      } catch (error) {
        console.error("Teacher login failed:", error);
        alert("Teacher login failed. Please try again.");
      }
    } else if (selectedRole === "student") {
      navigate("/student-home-page");
    } else {
      alert("Please select a role.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center w-full max-w-xl px-6">
        <button className="inline-flex items-center justify-center mb-5 px-6 py-2 rounded-[25px] text-white text-base font-medium bg-gradient-to-r from-[#7565D9] to-[#4D0ACD]">
          <img src={stars} alt="stars" className="px-1" />
          Intervue Poll
        </button>

        <h3 className="text-2xl font-bold mb-2">
          Welcome to the <b>Live Polling System</b>
        </h3>

        <p className="mb-8 text-gray-500">
          Please select the role that best describes you to begin using the live
          polling system
        </p>

        <div className="flex justify-around mb-6 flex-wrap gap-4">
          <div
            onClick={() => selectRole("student")}
            className={`cursor-pointer w-[45%] min-w-[200px] p-5 rounded-lg border-2 ${
              selectedRole === "student"
                ? "border-purple-600"
                : "border-gray-300"
            } bg-white`}
          >
            <p className="text-lg font-medium mb-2">I'm a Student</p>
            <span className="text-sm text-gray-500 block">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry
            </span>
          </div>

          <div
            onClick={() => selectRole("teacher")}
            className={`cursor-pointer w-[45%] min-w-[200px] p-5 rounded-lg border-2 ${
              selectedRole === "teacher"
                ? "border-purple-600"
                : "border-gray-300"
            } bg-white`}
          >
            <p className="text-lg font-medium mb-2">I'm a Teacher</p>
            <span className="text-sm text-gray-500 block">
              Submit answers and view live poll results in real-time.
            </span>
          </div>
        </div>

        <button
          onClick={continueToPoll}
          className="px-8 py-2 rounded-[25px] text-white text-base font-medium bg-gradient-to-r from-[#8F64E1] to-[#1D68BD]"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
