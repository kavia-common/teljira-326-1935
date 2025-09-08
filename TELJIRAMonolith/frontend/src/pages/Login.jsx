import React, { useState } from "react";
import axios from "axios";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("changeme");
  const [error, setError] = useState("");

  const doLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await axios.post("/api/auth/login", { email, password });
      onLogin(data.token);
    } catch (e) {
      setError("Login failed. You may need to register first.");
    }
  };

  const register = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await axios.post("/api/auth/register", {
        email,
        name: "Demo User",
        password,
      });
      const { data } = await axios.post("/api/auth/login", { email, password });
      onLogin(data.token);
    } catch (e) {
      setError("Register failed.");
    }
  };

  return (
    <form onSubmit={doLogin} aria-labelledby="login-header">
      <h1 id="login-header">Login</h1>
      {error && (
        <div role="alert" aria-live="assertive">
          {error}
        </div>
      )}
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        aria-required="true"
      />
      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        aria-required="true"
      />
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button type="submit">Login</button>
        <button onClick={register}>Register</button>
      </div>
    </form>
  );
}
