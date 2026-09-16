import { useState, useEffect, useRef } from "react";
import DigitalClock from "./DigitalClock";
import Stopwatch from "./StopWatch";
import {
  beginSpotifyLogin,
  disconnectSpotify,
  finishSpotifyLogin,
  getSpotifyPlaylists,
  isSpotifyConnected,
} from "./spotify";

function ToDo({ darkMode, setDarkMode }) {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
  });

  const [newTask, setNewTasks] = useState("");

  const [spotifyConnected, setSpotifyConnected] = useState(isSpotifyConnected);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState("");
  const spotifyCallbackHandled = useRef(false);
  const [spotifyStatus, setSpotifyStatus] = useState(() =>
    new URLSearchParams(window.location.search).get("error")
      ? "Spotify sign-in was cancelled."
      : "",
  );

  // const [selectedTask, setSelectedTask] = useState(null);

  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");

    if (error) {
      window.history.replaceState({}, "", "/");
      return;
    }

    if (!code) return;
    if (spotifyCallbackHandled.current) return;
    spotifyCallbackHandled.current = true;

    finishSpotifyLogin(code, params.get("state"))
      .then(() => {
        setSpotifyConnected(true);
        setSpotifyStatus("Spotify connected. Choose a playlist below.");
      })
      .catch((loginError) => setSpotifyStatus(loginError.message))
      .finally(() => window.history.replaceState({}, "", "/"));
  }, []);

  useEffect(() => {
    if (!spotifyConnected) return;

    getSpotifyPlaylists()
      .then((items) => {
        setPlaylists(items);
        setSelectedPlaylist((current) => current || items[0]?.id || "");
        if (!items.length) setSpotifyStatus("No Spotify playlists found.");
      })
      .catch((playlistError) => {
        setSpotifyStatus(playlistError.message);
        setSpotifyConnected(false);
      });
  }, [spotifyConnected]);

  function handleSpotifyLogin() {
    setSpotifyStatus("Opening Spotify sign-in…");
    beginSpotifyLogin().catch((loginError) => setSpotifyStatus(loginError.message));
  }

  function handleSpotifyDisconnect() {
    disconnectSpotify();
    setSpotifyConnected(false);
    setPlaylists([]);
    setSelectedPlaylist("");
    setSpotifyStatus("Spotify disconnected.");
  }

  const activePlaylist = playlists.find((playlist) => playlist.id === selectedPlaylist);


  function handleInputChange(event) {
    setNewTasks(event.target.value);
  }

  function addTask() {
    if (newTask.trim() === "") return;

    setTasks((t) => [
      ...t,
      { id: Date.now(), text: newTask, completed: false, focus: false, time:0 },
    ]);
    setNewTasks("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      addTask();
    }
  }

  function toggleTaskCompletion(index) {
    const updatedTask = tasks.map((task, i) =>
      i === index ? { ...task, completed: !task.completed } : task,
    );
    setTasks(updatedTask);
  }

  function toggleFocusMode(index) {
    setTasks(
      tasks.map((task, i) =>
        i === index ? { ...task, focus: !task.focus } : task,
      ),
    );
  }

  function deleteSelectedTasks() {
    const updatedTasks = tasks.filter((task) => !task.completed);
    setTasks(updatedTasks);
  }

  function updatedTaskTime(index, time) {
    setTasks(
      tasks.map((task, i) => (i === index ? { ...task, time } : task)),
    );
  }

  const completedTasks = tasks.filter((task) => task.completed).length;


  return (
    <div className={`todo-card ${darkMode ? "dark" : ""}`}>
      <div className="hero-panel">
        <div className="todo-header">
          <div className="title-group">
            <p className="eyebrow">Focus To-Do List</p>
            <h1>Stay calm. Finish what matters.</h1>
          </div>

          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        <DigitalClock />

        <div className="stats-row">
          <div className="stat-chip">
            <span className="stat-label">Total Tasks</span>
            <strong>{tasks.length}</strong>
          </div>
          <div className="stat-chip">
            <span className="stat-label">Completed</span>
            <strong>{completedTasks}</strong>
          </div>
        </div>
      </div>

      <div className="composer-card">
        <div className="section-heading">
          <div>
            <p className="section-label">Tasks</p>
            <h2>Plan your next move</h2>
          </div>
        </div>

        <div className="todo-input">
          <input
            type="text"
            ref={inputRef}
            value={newTask}
            onKeyDown={handleKeyDown}
            onChange={handleInputChange}
            placeholder="What needs your attention today?"
          />

          <button className="primary-button" onClick={addTask}>
            Add Task
          </button>
        </div>
      </div>

      <div className="task-list">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks yet. Add one and click its title to open focus mode.</p>
          </div>
        ) : (
          tasks.map((task, index) => (
            <div
              key={task.id}
              className={`task-card ${task.completed ? "is-complete" : ""} ${task.focus ? "is-focused" : ""}`}
            >
              <li className="task">
                <label className="checkbox-wrap">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTaskCompletion(index)}
                  />
                  <span className="checkbox-custom"></span>
                </label>

                <button
                  type="button"
                  className="task-text-button"
                  onClick={() => toggleFocusMode(index)}
                >
                  <span className="task-text">{task.text}</span>
                  <span className="task-hint">
                    {task.focus ? "Hide focus mode" : "Open focus mode"}
                  </span>
                </button>
              </li>

              <div
                className="focus-mode-card"
                style={{ display: task.focus ? "grid" : "none" }}
              >
                <div className="focus-mode-copy">
                  <p className="section-label">Focus Mode</p>
                  <h3>{task.text}</h3>
                  <p className="focus-description">
                    Set the mood, start the timer, and work on one thing at a
                    time.
                  </p>
                </div>

                <div className="spotify-embed">
                  <span>Featured focus track</span>
                  <iframe
                    data-testid="embed-iframe"
                    title="Featured Spotify focus track"
                    src="https://open.spotify.com/embed/track/54RtfCu9vhgYzMRgaOCilH?utm_source=generator&si=6c7a57a83f384321"
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                </div>

                <div className="audio-player">
                  <span>Spotify Playlist</span>
                  {spotifyConnected ? (
                    <>
                      <select
                        value={selectedPlaylist}
                        onChange={(event) => setSelectedPlaylist(event.target.value)}
                        aria-label="Select a Spotify playlist"
                      >
                        {playlists.map((playlist) => (
                          <option key={playlist.id} value={playlist.id}>
                            {playlist.name}
                          </option>
                        ))}
                      </select>
                      <div className="spotify-actions">
                        <a
                          className="primary-button spotify-link"
                          href={activePlaylist?.external_urls?.spotify || "#"}
                          target="_blank"
                          rel="noreferrer"
                          aria-disabled={!activePlaylist}
                        >
                          Open in Spotify
                        </a>
                        <button className="spotify-text-button" onClick={handleSpotifyDisconnect}>
                          Disconnect
                        </button>
                      </div>
                    </>
                  ) : (
                    <button className="primary-button" onClick={handleSpotifyLogin}>
                      Connect Spotify
                    </button>
                  )}
                  {spotifyStatus && <p className="spotify-status" role="status">{spotifyStatus}</p>}
                </div>

                <Stopwatch
                  savedTime={task.time}
                  updateTime={(time) => updatedTaskTime(index, time)}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {tasks.some((task) => task.completed) && (
        <button className="danger-button" onClick={deleteSelectedTasks}>
          Delete Completed
        </button>
      )}
    </div>
  );
}

export default ToDo;
