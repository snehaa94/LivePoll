import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import stopwatch from "../../assets/stopwatch.svg";
import ChatPopover from "../../components/chat/ChatPopover";
import { useNavigate } from "react-router-dom";
import stars from "../../assets/spark.svg";

let apiUrl =
  import.meta.env.VITE_NODE_ENV === "production"
    ? import.meta.env.VITE_API_BASE_URL
    : "http://localhost:5000";
const socket = io(apiUrl);

const StudentPollPage = () => {
  const [votes, setVotes] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState([]);
  const [pollId, setPollId] = useState("");
  const [kickedOut, setKickedOut] = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (selectedOption) {
      const username = sessionStorage.getItem("username");
      if (username) {
        socket.emit("submitAnswer", {
          username,
          option: selectedOption,
          pollId,
        });
        setSubmitted(true);
      }
    }
  };

  useEffect(() => {
    const handleKickedOut = () => {
      setKickedOut(true);
      sessionStorage.removeItem("username");
      navigate("/kicked-out");
    };

    socket.on("kickedOut", handleKickedOut);
    return () => socket.off("kickedOut", handleKickedOut);
  }, [navigate]);

  useEffect(() => {
    socket.on("pollCreated", (pollData) => {
      setPollQuestion(pollData.question);
      setPollOptions(pollData.options);
      setVotes({});
      setSubmitted(false);
      setSelectedOption(null);
      setTimeLeft(pollData.timer);
      setPollId(pollData._id);
    });

    socket.on("pollResults", (updatedVotes) => setVotes(updatedVotes));

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !submitted) {
      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setSubmitted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, submitted]);

  const calculatePercentage = (count) => {
    if (totalVotes === 0) return 0;
    return (count / totalVotes) * 100;
  };

  return (
    <>
      <ChatPopover />
      {kickedOut ? (
        <div>Kicked</div>
      ) : (
        <>
          {/* Loader screen */}
          {pollQuestion === "" && timeLeft === 0 && (
            <div className="flex justify-center items-center min-h-screen w-3/4 mx-auto">
              <div className="text-center">
                <button className="flex items-center justify-center px-3 py-1 text-sm rounded-full bg-purple-600 text-white mb-5">
                  <img src={stars} className="px-1" alt="" />
                  Intervue Poll
                </button>
                <div className="flex justify-center mb-4">
                  <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-[#500ECE] rounded-full"></div>
                </div>
                <h3 className="text-xl font-bold">
                  Wait for the teacher to ask questions..
                </h3>
              </div>
            </div>
          )}

          {/* Poll screen */}
          {pollQuestion !== "" && (
            <div className="container mx-auto mt-5 w-1/2">
              <div className="flex items-center mb-4">
                <h5 className="m-0 pr-5">Question</h5>
                <img src={stopwatch} width="15" alt="Stopwatch" />
                <span className="pl-2 text-red-500">{timeLeft}s</span>
              </div>

              <div className="bg-white shadow rounded-lg">
                <div className="p-4">
                  <h6 className="py-2 px-3 rounded text-white bg-gradient-to-r from-[#343434] to-[#6E6E6E] inline-block">
                    {pollQuestion}?
                  </h6>

                  <div className="mt-4">
                    {pollOptions.map((option) => (
                      <div
                        key={option.id}
                        className={`rounded m-1 p-3 border ${
                          selectedOption === option.text
                            ? "border-[#7565d9]"
                            : "border-gray-300"
                        } cursor-pointer ${
                          submitted || timeLeft === 0
                            ? "cursor-not-allowed opacity-70"
                            : ""
                        }`}
                        onClick={() => {
                          if (!submitted && timeLeft > 0) {
                            handleOptionSelect(option.text);
                          }
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <span
                            className={`${
                              submitted ? "font-semibold" : "font-normal"
                            }`}
                          >
                            {option.text}
                          </span>
                          {submitted && (
                            <span>
                              {Math.round(
                                calculatePercentage(votes[option.text] || 0)
                              )}
                              %
                            </span>
                          )}
                        </div>

                        {submitted && (
                          <div className="w-full bg-gray-200 h-2 rounded mt-2">
                            <div
                              className="h-2 rounded bg-[#7565d9]"
                              style={{
                                width: `${calculatePercentage(
                                  votes[option.text] || 0
                                )}%`,
                              }}
                            ></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit button */}
              {!submitted && selectedOption && timeLeft > 0 && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="bg-purple-600 text-white py-2 px-4 rounded-lg mt-3 w-1/4"
                    onClick={handleSubmit}
                  >
                    Submit
                  </button>
                </div>
              )}

              {/* After submit */}
              {submitted && (
                <div className="mt-5">
                  <h6 className="text-center font-medium">
                    Wait for the teacher to ask a new question...
                  </h6>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default StudentPollPage;
