import React, { useActionState } from "react";
import { Link, useNavigate } from "react-router";
import "./LoginPage.css";

async function sendPostRequest(url, body) {
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    const data = response.headers.get("Content-Type")?.includes("application/json")
        ? await response.json()
        : null;
    return { status: response.status, data };
}

export function LoginPage({ isRegistering, onAuthToken }) {
    const navigate = useNavigate();
    const usernameInputId = React.useId();
    const passwordInputId = React.useId();
    const emailInputId = React.useId();

    async function handleSubmit(_prevResult, formData) {
        const username = formData.get("username");
        const password = formData.get("password");

        if (isRegistering) {
            const email = formData.get("email");
            if (!username || !email || !password) {
                return "Please fill in all fields.";
            }
            const { status, data } = await sendPostRequest("/api/users", { username, email, password });
            if (status === 201) {
                if (data?.token) {
                    onAuthToken(data.token);
                }
                navigate("/");
                return null;
            }
            if (status === 409) {
                return "Username already taken. Please choose a different one.";
            }
            return data?.message || "Registration failed. Please try again.";
        } else {
            if (!username || !password) {
                return "Please fill in all fields.";
            }
            const { status, data } = await sendPostRequest("/api/auth/tokens", { username, password });
            if (status === 200 && data?.token) {
                onAuthToken(data.token);
                navigate("/");
                return null;
            }
            if (status === 401) {
                return "Incorrect username or password.";
            }
            return data?.message || "Login failed. Please try again.";
        }
    }

    const [result, submitAction, isPending] = useActionState(handleSubmit, null);

    return (
        <>
            <h2>{isRegistering ? "Register a new account" : "Login"}</h2>
            <form className="LoginPage-form" action={submitAction}>
                <label htmlFor={usernameInputId}>Username</label>
                <input id={usernameInputId} name="username" disabled={isPending} required />

                {isRegistering && (
                    <>
                        <label htmlFor={emailInputId}>Email</label>
                        <input id={emailInputId} name="email" type="email" disabled={isPending} required />
                    </>
                )}

                <label htmlFor={passwordInputId}>Password</label>
                <input id={passwordInputId} name="password" type="password" disabled={isPending} required />

                <input type="submit" value={isPending ? "Submitting..." : "Submit"} disabled={isPending} />
            </form>
            <div aria-live="assertive">
                {result && <p style={{ color: "red" }}>{result}</p>}
            </div>
            <p>
                {isRegistering
                    ? <>Already have an account? <Link to="/login">Login here</Link></>
                    : <>Don&apos;t have an account? <Link to="/register">Register here</Link></>
                }
            </p>
        </>
    );
}
