import React, { useState } from "react";
import stars from "../../assets/spark.svg";
import { useNavigate } from "react-router-dom";

const StudentLandingPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");

  const handleStudentLogin = async (e) => {
    e.preventDefault();

    if (name.trim()) {
      try {
        sessionStorage.setItem("username", name);
        navigate("/poll-question");
      } catch (error) {
        console.error("Error logging in student:", error);
        alert("Error connecting to the server. Please try again.");
      }
    } else {
      alert("Please enter your name");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full max-w-2xl mx-auto">
      <div className="text-center w-full">
        {/* Top Logo Button */}
        <button className="inline-flex items-center justify-center mb-5 px-6 py-2 rounded-[25px] text-white text-base font-medium bg-gradient-to-r from-[#7565D9] to-[#4D0ACD]">
          <img src={stars} className="px-1" alt="spark" />
          Intervue Poll
        </button>

        {/* Title */}
        <h3 className="text-2xl font-bold mb-2">
          Let&apos;s <b>Get Started</b>
        </h3>

        {/* Description */}
        <p className="mb-8 text-gray-500">
          If you&apos;re a student, you&apos;ll be able to{" "}
          <b className="text-black">submit your answers</b>, participate in live
          polls, and see how your responses compare with your classmates
        </p>

        {/* Form */}
        <form onSubmit={handleStudentLogin} className="w-full max-w-md mx-auto">
          <div className="my-4">
            <p className="text-left mb-1 font-medium">Enter your Name</p>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              onChange={(e) => setName(e.target.value)}
            />
            <button
              type="submit"
              className="mt-4 px-8 py-2 rounded-[25px] text-white text-base font-medium bg-gradient-to-r from-[#8F64E1] to-[#1D68BD]"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentLandingPage;
