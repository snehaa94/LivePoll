import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import backIcon from "../../assets/back.svg";

let apiUrl =
  import.meta.env.VITE_NODE_ENV === "production"
    ? import.meta.env.VITE_API_BASE_URL
    : "http://localhost:5000";

const socket = io(apiUrl);

const PollHistoryPage = () => {
  const [polls, setPolls] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getPolls = async () => {
      const username = sessionStorage.getItem("username");

      try {
        const response = await axios.get(`${apiUrl}/polls/${username}`);
        setPolls(response.data.data);
      } catch (error) {
        console.error("Error fetching polls:", error);
      }
    };

    getPolls();
  }, []);

  const calculatePercentage = (count, totalVotes) => {
    if (totalVotes === 0) return 0;
    return (count / totalVotes) * 100;
  };

  const handleBack = () => {
    navigate("/teacher-home-page");
  };

  let questionCount = 0;

  return (
    <div className="mt-10 w-full max-w-2xl mx-auto">
      {/* Back Button + Title */}
      <div className="mb-6 flex items-center gap-2 text-gray-800">
        <img
          src={backIcon}
          alt="back"
          width="25"
          className="cursor-pointer"
          onClick={handleBack}
        />
        <span>
          View <b>Poll History</b>
        </span>
      </div>

      {polls.length > 0 ? (
        polls.map((poll) => {
          const totalVotes = poll.options.reduce(
            (sum, option) => sum + option.votes,
            0
          );

          return (
            <div key={poll._id} className="mb-6">
              <div className="pb-2 text-gray-600">{`Question ${++questionCount}`}</div>

              <div className="bg-white shadow rounded-lg">
                <div className="p-4">
                  {/* Question */}
                  <h6 className="bg-indigo-600 text-white text-left rounded px-3 py-2 font-medium">
                    {poll.question} ?
                  </h6>

                  {/* Options */}
                  <div className="mt-4">
                    {poll.options.map((option) => (
                      <div
                        key={option._id}
                        className="bg-gray-50 rounded border border-gray-200 p-3 mb-3"
                      >
                        <div className="flex justify-between items-center text-sm font-medium">
                          <span>{option.text}</span>
                          <span>
                            {Math.round(
                              calculatePercentage(option.votes, totalVotes)
                            )}
                            %
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-gray-200 rounded h-2 mt-2">
                          <div
                            className="bg-indigo-500 h-2 rounded"
                            style={{
                              width: `${calculatePercentage(
                                option.votes,
                                totalVotes
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-gray-500 italic">Polls not found</div>
      )}
    </div>
  );
};

export default PollHistoryPage;
