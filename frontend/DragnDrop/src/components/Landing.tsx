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
          <div className="logo">DAWKER</div>

          <ul className="links">
            <li>
              <Link to="/myDaws">My DAWs</Link>
            </li>
            <li>
              <Link to="/search">Search</Link>
            </li>
          </ul>

          <div className="buttons">
            <Link to="/signup">Sign Up</Link>
            <Link to="/login">Log In</Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="hero-section">
          <h1>Build, Share, and Use Custom DAWs</h1>
          <p>
            DAWKER lets you design Digital Audio Workstations for any workflow,
            edit audio directly, and share setups with the community.
          </p>
        
          <div className="buttons">
            <Link to="/signup" className="button">Get Started Free</Link>
            <Link to="/search" className="button">Explore DAWs</Link>
          </div>
        </section>
        <section className="how-it-works">
          <h2>How DAWKER Works</h2>
        
          <div className="steps">
            <div className="step">
              <h3>Create</h3>
              <p>Design a DAW for recording, mixing, or sound design.</p>
            </div>
            <br></br>
            <div className="step">
              <h3>Edit</h3>
              <p>Record or upload audio and work directly in your DAW.</p>
            </div>
            <br></br>
            <div className="step">
              <h3>Share</h3>
              <p>Publish your setup so others can use or remix it.</p>
            </div>
          </div>
        </section>
        <section className="features-section">
          <h2>Everything You Need</h2>
        
          <div className="feature-grid">
            <div className="feature-card">
              <h3>User Accounts</h3>
              <p>Sign up and manage all your DAWs in one place.</p>
            </div>
        
            <div className="feature-card">
              <h3>Custom DAWs</h3>
              <p>Create DAWs for recording, mixing, or live performance.</p>
            </div>
        
            <div className="feature-card">
              <h3>Audio Editing</h3>
              <p>Record or upload audio files directly into your workspace.</p>
            </div>
        
            <div className="feature-card">
              <h3>Community Sharing</h3>
              <p>Browse and save DAWs created by other users.</p>
            </div>
          </div>
        </section>
        <section className="showcase-section">
          <h2>Designed for Musicians & Producers</h2>
        
          <div className="showcase-row">
            <img
              src="/src/assets/homepage.png"
              alt="homepage screenshot"
              className="showcase-image"
            />
            <div className="showcase-text">
              <p>Build workflows that match your creative process.</p>
            </div>
          </div>
        
          <div className="showcase-row reverse">
            <img
              src="/src/assets/community.png"
              alt="community screenshot"
              className="showcase-image"
            />
            <div className="showcase-text">
              <p>Share and receive workflows with the community.</p>
            </div>
          </div>
        </section>
        <section className="cta-section">
          <h2>Start Building Your DAWs Today</h2>
          <p>It’s free, fast, and built for creators.</p>
          <div className="buttons">
            <Link to="/signup" className="button">
              Create Your Account
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
