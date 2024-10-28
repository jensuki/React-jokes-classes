import React, { useState, useEffect } from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";

function JokeList({ numJokesToGet = 5 }) {
  const [jokes, setJokes] = useState([]); // State to store jokes
  const [isLoading, setIsLoading] = useState(true); // Loading state

  // fetch jokes from API
  useEffect(() => {
    async function getJokes() {
      setIsLoading(true); // Set loading to true while fetching
      let jokesArray = []; // Temporary array to collect unique jokes
      let seenJokes = new Set(); // Set to track unique joke IDs

      try {
        while (jokesArray.length < numJokesToGet) {
          const res = await axios.get("https://icanhazdadjoke.com", {
            headers: { Accept: "application/json" },
          });
          const jokeObj = res.data;

          // Check for duplicate jokes by ID
          if (!seenJokes.has(jokeObj.id)) {
            seenJokes.add(jokeObj.id);
            jokesArray.push({ ...jokeObj, votes: 0 }); // Add joke with initial votes
          } else {
            console.log("Duplicate joke found! Skipping...");
          }
        }
        setJokes(jokesArray); // Update jokes state with unique jokes
        setIsLoading(false); // Stop loading after jokes are loaded
      } catch (err) {
        console.error("Error fetching jokes:", err);
        setIsLoading(false); // Stop loading on error
      }
    }

    if (jokes.length === 0) getJokes(); // Fetch jokes only if list is empty
  }, [jokes, numJokesToGet]); // Dependencies to re-run if numJokesToGet changes

  // reset and fetch new jokes
  const generateNewJokes = () => {
    setJokes([]); // Clear jokes to trigger a new fetch
    setIsLoading(true); // Set loading to true for spinner
  };

  // handle voting
  const vote = (id, delta) => {
    setJokes(jokes =>
      jokes.map(joke =>
        joke.id === id ? { ...joke, votes: joke.votes + delta } : joke
      )
    );
  };

  // Sort jokes by votes
  const sortedJokes = [...jokes].sort((a, b) => b.votes - a.votes);

  // Render loading spinner or list of sorted jokes
  if (isLoading) {
    return (
      <div className="loading">
        <i className="fas fa-4x fa-spinner fa-spin" />
      </div>
    );
  }

  return (
    <div className="JokeList">
      <button className="JokeList-getmore" onClick={generateNewJokes}>
        Get New Jokes
      </button>

      {sortedJokes.map(j => (
        <Joke
          key={j.id}
          text={j.joke}
          id={j.id}
          votes={j.votes}
          vote={vote}
        />
      ))}
    </div>
  );
}

export default JokeList;
