import React, { useState, FormEvent, ChangeEvent } from 'react';
import '../Login.css';
import Dither from './Dither';
import { userAPI } from '../utils/userAPI';
import { useNavigate } from 'react-router-dom';
import { userDTO } from '../dtos/types';



export default function Loggin() {

  const navigate = useNavigate();

  // TypeScript infers string type automatically from the initial value ''
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  // // 3. Type the FormEvent
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setError('');

    // persist simple user info so Search components can read it
    try {
        const handleLogin = async () => {

          const user: userDTO | null = await userAPI.login(email, password);

          if (user) {
            const verifiedUser: userDTO = user; 
            console.log("Logged in:", verifiedUser.email);
            navigate('/userpage')
            
          } else {
            alert("Invalid credentials");
          }
        }

        handleLogin();

    } catch (err) {
      // ignore storage errors
    }

    // onLogin(loggedInUser);
    // // notify other components
    // window.dispatchEvent(new CustomEvent('dawker:login', { detail: loggedInUser }));
  }

  return (
    <div className="login-page">
      <div className="dither-wrapper" aria-hidden>
        <Dither
          waveColor={[0.133,0.773,0.369]}
          disableAnimation={false}
          enableMouseInteraction={true}
          mouseRadius={0.25}
          colorNum={4}
          pixelSize={3}
          waveAmplitude={0.3}
          waveFrequency={3}
          waveSpeed={0.25}
        />
      </div>
      <div className="login-card">
        <h1 className="brand-main">DAWKER</h1>
        <h2 className="login-subtitle">Where your audio dreams come to life.</h2>
        <h2 className="login-title">Login</h2>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <div className="field-label">Username</div>
            <div className="input-wrapper">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" stroke="#b0b7c3" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 21v-1c0-2.76-3.58-5-8-5s-8 2.24-8 5v1" stroke="#b0b7c3" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                className="input"
                type="text"
                placeholder="Email or DawUserID"
                aria-label="username"
                autoComplete="username"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                spellCheck={false}
              />
            </div>
          </label>

          <label className="field">
            <div className="field-label">Password</div>
            <div className="input-wrapper">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="#b0b7c3" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 11V8a5 5 0 0 1 10 0v3" stroke="#b0b7c3" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                className="input"
                type="password"
                placeholder="Type your password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              />
            </div>
            <div className="forgot"><a href="#">Forgot password?</a></div>
          </label>

          {error && <div className="error">{error}</div>}
          <div style={{display:'flex',gap:8}}>
            <button className="btn primary gradient" type="submit">LOGIN</button>
            <button type="button" className="btn" onClick={() => navigate('/create-account')}>Create account</button>
          </div>
        
        </form>
      </div>
    </div>
  );
}