import React, { useState } from 'react'
import '../Login.css'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter email and password')
      return
    }
    // Simple fake auth: accept any non-empty credentials
    setError('')
    const userObj = { name: email.split('@')[0] || 'User', email }
    // persist simple user info so search can read it
    try {
      localStorage.setItem('dawker_user', JSON.stringify(userObj))
    } catch (err) {
      // ignore storage errors
    }
    onLogin(userObj)
    // dispatch an event so any open components can react immediately
    window.dispatchEvent(new CustomEvent('dawker:login', { detail: userObj }))
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="brand-main">Dawker</h1>
        <h2 className="login-title">Login</h2>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <div className="field-label">Username</div>
            <div className="input-wrapper">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" stroke="#b0b7c3" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 21v-1c0-2.76-3.58-5-8-5s-8 2.24-8 5v1" stroke="#b0b7c3" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <input
                className="input"
                type="text"
                placeholder="Phone, email, or username"
                aria-label="username"
                autoComplete="username"
                value={email}
                onChange={e => setEmail(e.target.value)}
                spellCheck={false}
              />
            </div>
          </label>

          <label className="field">
            <div className="field-label">Password</div>
            <div className="input-wrapper">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="11" width="18" height="11" rx="2" stroke="#b0b7c3" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 11V8a5 5 0 0 1 10 0v3" stroke="#b0b7c3" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <input
                className="input"
                type="password"
                placeholder="Type your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div className="forgot"><a href="#">Forgot password?</a></div>
          </label>

          {error && <div className="error">{error}</div>}

          <button className="btn primary gradient" type="submit">LOGIN</button>

          <div className="or">Or Sign Up Using</div>

          <div className="socials">
            <button type="button" className="social-btn fb">F</button>
            <button type="button" className="social-btn tw">T</button>
            <button type="button" className="social-btn gg">G</button>
          </div>

          <div className="signup">Or Sign Up Using <a href="#">SIGN UP</a></div>

        </form>
      </div>
    </div>
  )
}
