import React from "react";
import "../Landing.css";
import { Link } from "react-router-dom";

const Landing: React.FC = () => {
  return (
    <div>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Gruppo&display=swap');
      </style>
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">Amplify</div>

          <ul className="links">
            <li>
              <Link to="/myDaws">My DAWs</Link>
            </li>
            <li>
              <Link to="/search">Search</Link>
            </li>
          </ul>

          <div className="auth-buttons">
            <Link to="/signup">Sign Up</Link>
            <Link to="/login">Log In</Link>
          </div>
        </div>
      </nav>

      <main className="hero">
        <h1 className="welcome">Welcome to<br />Amplify</h1>

        <p className="subtitle">
          The free site where you can configure your own Digital Audio
          Workstations (DAWs), use them to edit audio files, and share those
          configurations with others!
        </p>

        <ul className="features">
          <li>Sign up or log in to your own account</li>
          <li>Create and keep track of all of your custom DAWs for any scenario</li>
          <li>Record audio or upload your own audio files</li>
          <li>Browse other users' DAWs and save them to use yourself</li>
        </ul>

        <h2>Get started with<br />Amplify today!</h2>

        <div className="auth-buttons">
          <Link to="/signup">Sign Up</Link>
          <Link to="/login">Log In</Link>
        </div>
      </main>
    </div>
  );
};

export default Landing;
