import { useState, useEffect, useRef } from "react";
import DigitalClock from "./DigitalClock";
import Stopwatch from "./StopWatch";

function ToDo({ darkMode, setDarkMode }) {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
  });

  const [newTask, setNewTasks] = useState("");

  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

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

                <div className="spotify-embeds">
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
                  <div className="spotify-embed">
                    <span>Featured focus track</span>
                    <iframe
                      data-testid="embed-iframe"
                      title="Second featured Spotify focus track"
                      src="https://open.spotify.com/embed/track/1RgIpHr4as1vh9abRreEVH?utm_source=generator&si=1c555a953bbd43c3"
                      width="100%"
                      height="152"
                      frameBorder="0"
                      allowFullScreen
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                    />
                  </div>
                  <div className="spotify-embed">
                    <span>Featured focus track</span>
                    <iframe
                      data-testid="embed-iframe"
                      title="Third featured Spotify focus track"
                      src="https://open.spotify.com/embed/track/6uLAlc8WCjwR4aOGDsjcCI?utm_source=generator&si=aaa4e4bb7c6541ed"
                      width="100%"
                      height="152"
                      frameBorder="0"
                      allowFullScreen
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                    />
                  </div>
                  <div className="spotify-embed">
                    <span>Featured focus track</span>
                    <iframe
                      data-testid="embed-iframe"
                      title="Fourth featured Spotify focus track"
                      src="https://open.spotify.com/embed/track/3yunUVncMdVo9YlaJi7TuG?utm_source=generator&si=1cad0936ea8f4c63"
                      width="100%"
                      height="152"
                      frameBorder="0"
                      allowFullScreen
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                    />
                  </div>
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
