import React, { useState, FormEvent, ChangeEvent } from 'react';
import '../Login.css';
import Dither from './Dither';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../utils/userAPI';
import { RegisterDTO } from '../dtos/types';

export default function CreateAccount() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const validateEmail = (value: string) => /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (!username || !email || !password) {
      setError('Please fill all fields');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const payload: RegisterDTO = { username, email, password };
      const created = await userAPI.register(payload);
      if (!created) {
        setError('Username or email already in use');
        setLoading(false);
        return;
      }

      // persist session (same key used by userAPI)
      localStorage.setItem('dawker_session_user', JSON.stringify(created));
      userAPI.currentUser = created;

      navigate('/userpage');
    } catch (err) {
      console.error('Register error', err);
      setError('Failed to register. Try again later.');
    } finally {
      setLoading(false);
    }
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
        <h2 className="login-title">Create Account</h2>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <div className="field-label">Username</div>
            <div className="input-wrapper">
              <input className="input" value={username} onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)} spellCheck={false} />
            </div>
          </label>

          <label className="field">
            <div className="field-label">Email</div>
            <div className="input-wrapper">
              <input className="input" value={email} onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} spellCheck={false} />
            </div>
          </label>

          <label className="field">
            <div className="field-label">Password</div>
            <div className="input-wrapper">
              <input className="input" type="password" value={password} onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
            </div>
          </label>

          {error && <div className="error">{error}</div>}

          <div style={{display:'flex',gap:8}}>
            <button className="btn primary gradient" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
            <button className="btn" type="button" onClick={() => navigate('/login')}>Back to Login</button>
          </div>
        </form>
      </div>
    </div>
  );
}
