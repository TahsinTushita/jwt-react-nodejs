import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  faCheck,
  faTimes,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import "./App.css";

const NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9-_]{3,23}$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const SIGNUP_URL = "/users";

const SignUp = () => {
  const nameRef = useRef();
  const errRef = useRef();

  const [name, setName] = useState("");
  const [isNameValid, setIsNameValid] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);

  const [password, setPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const [confirmPassword, setConfirmPassword] = useState("");
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] =
    useState(false);

  const [errMsg, setErrMsg] = useState("");
  const [isSuccessful, setIsSuccessful] = useState(false);

  // focus on the name field upon loading the page
  useEffect(() => {
    nameRef.current.focus();
  }, []);

  // test if the name is valid
  useEffect(() => {
    const result = NAME_REGEX.test(name);
    console.log(result);
    console.log(name);
    setIsNameValid(result);
  }, [name]);

  // test if the password is valid
  useEffect(() => {
    const result = PASSWORD_REGEX.test(password);
    console.log(result);
    console.log(password);
    setIsPasswordValid(result);

    const isMatch = password === confirmPassword;
    setIsConfirmPasswordValid(isMatch);
  }, [password, confirmPassword]);

  // clear out the error message once the user starts editing after getting an error
  useEffect(() => {
    setErrMsg("");
  }, [name, password, confirmPassword]);

  async function handleSignup(e) {
    e.preventDefault();

    // if button is enabled with JS hack
    const v1 = NAME_REGEX.test(name);
    const v2 = PASSWORD_REGEX.test(password);

    if (!v1 || !v2) {
      setErrMsg("Invalid entry");
      return;
    }

    try {
      const res = await axios.post(SIGNUP_URL, { name, password });

      console.log(res.data);
      setIsSuccessful(true);

      // clear input fields
      setName("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      // setErrMsg(err);
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 409) {
        setErrMsg("Username Taken");
      } else {
        setErrMsg("Registration Failed");
      }
      errRef.current.focus();
    }
  }

  return (
    <>
      {isSuccessful ? (
        <section className="login">
          <h1>Success!</h1>
          <p className="link-to">
            <Link to="/">Log in</Link>
          </p>
        </section>
      ) : (
        <section className="login">
          {/* show the error message and make it accessible for screen readers */}
          <p
            ref={errRef}
            className={errMsg ? "errmsg" : "offscreen"}
            aria-live="assertive"
          >
            {errMsg}
          </p>

          <form onSubmit={handleSignup}>
            <span className="formTitle">Demo SignUp</span>

            <div className="form-row">
              <label htmlFor="name">
                Name
                <span className={isNameValid ? "valid" : "hide"}>
                  <FontAwesomeIcon icon={faCheck} />
                </span>
                <span className={isNameValid || !name ? "hide" : "invalid"}>
                  <FontAwesomeIcon icon={faTimes} />
                </span>
              </label>

              <input
                type="text"
                id="name"
                name="name"
                placeholder="name"
                ref={nameRef}
                autoComplete="off"
                onChange={(e) => setName(e.target.value)}
                required
                aria-invalid={isNameValid ? false : true}
                aria-describedby="uidnote"
                onFocus={() => setIsNameFocused(true)}
                onBlur={() => setIsNameFocused(false)}
              />
              <p
                id="uidnote"
                className={
                  isNameFocused && name && !isNameValid
                    ? "instructions"
                    : "offscreen"
                }
              >
                <FontAwesomeIcon icon={faInfoCircle} />
                4 to 24 characters. <br />
                Must begin with a letter. <br />
                Letters, numbers, underscores, hyphens allowed.
              </p>
            </div>

            <div className="form-row">
              <label htmlFor="password">
                Password
                <span className={isPasswordValid ? "valid" : "hide"}>
                  <FontAwesomeIcon icon={faCheck} />
                </span>
                <span
                  className={isPasswordValid || !password ? "hide" : "invalid"}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </span>
              </label>

              <input
                type="password"
                id="password"
                name="password"
                placeholder="password"
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-invalid={isPasswordValid ? false : true}
                aria-describedby="pwdnote"
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
              />
              <p
                id="pwdnote"
                className={
                  isPasswordFocused && !isPasswordValid
                    ? "instructions"
                    : "offscreen"
                }
              >
                <FontAwesomeIcon icon={faInfoCircle} />
                8 to 24 characters. <br />
                Must include uppercase and lowercase letters, a number and a
                special character. <br />
                Allowed special characters:{" "}
                <span aria-label="exclamation mark">!</span>
                <span aria-label="at symbol">@</span>
                <span aria-label="hashtag">#</span>
                <span aria-label="dollar sign">$</span>
                <span aria-label="percent">%</span>
              </p>
            </div>

            <div className="form-row">
              <label htmlFor="confirm-password">
                Confirm Password
                <span
                  className={
                    isConfirmPasswordValid && confirmPassword ? "valid" : "hide"
                  }
                >
                  <FontAwesomeIcon icon={faCheck} />
                </span>
                <span
                  className={
                    isConfirmPasswordValid || !confirmPassword
                      ? "hide"
                      : "invalid"
                  }
                >
                  <FontAwesomeIcon icon={faTimes} />
                </span>
              </label>

              <input
                type="password"
                id="confirm-password"
                name="confirm-password"
                placeholder="confirm-password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                aria-invalid={isConfirmPasswordValid ? false : true}
                aria-describedby="confirmnote"
                onFocus={() => setIsConfirmPasswordFocused(true)}
                onBlur={() => setIsConfirmPasswordFocused(false)}
              />
              <p
                id="confirmnote"
                className={
                  isConfirmPasswordFocused && !isConfirmPasswordValid
                    ? "instructions"
                    : "offscreen"
                }
              >
                <FontAwesomeIcon icon={faInfoCircle} />
                Must match the first password input field.
              </p>
            </div>

            <button
              type="submit"
              className="submitButton"
              disabled={
                !isNameValid || !isPasswordValid || !isConfirmPasswordValid
                  ? true
                  : false
              }
            >
              Sign Up
            </button>
          </form>

          <p className="link-to">
            Already signed up?
            <br />
            <span>
              <Link to="/">Log in</Link>
            </span>
          </p>
        </section>
      )}
    </>
  );
};

export default SignUp;
