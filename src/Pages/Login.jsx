// src/components/Login.js
import React, { useState } from "react";
import { Button, Form, Container, Alert } from "react-bootstrap";
import { login } from "../api";
import { redirect } from "react-router-dom";

const Login = () => {
    // { onLogin }
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        debugger;
      const res = await login(username, password);
      const token = res.data.token;
      localStorage.setItem("token", token);
    //   onLogin(); // Callback to let parent know login is successful
      
    } catch (err) {
      setError("Invalid credentials.");
    }
  };

  return (
    <Container style={{ maxWidth: "400px", marginTop: "50px" }}>
      <h4>Login</h4>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="username" className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </Form.Group>
        <Form.Group controlId="password" className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Form.Group>
        <Button variant="primary" type="submit">
          Login
        </Button>
      </Form>
    </Container>
  );
};

export default Login;
