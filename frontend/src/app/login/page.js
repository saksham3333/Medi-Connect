'use client';

import userService from '@/services/userService';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

import React, { useState } from 'react';
import {
  Button,
  Checkbox,
  TextInput,
  Form,
  Toggletip,
  ToggletipButton,
  ToggletipContent,
  Grid,
  Column,
  Modal,
} from '@carbon/react';
import { ArrowRight, Information, View, ViewOff } from '@carbon/icons-react';

export default function LoginPage() {
  const { setIsLoggedIn, setFirstName, checkLoginStatus } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordType, setPasswordType] = useState('password');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordType(passwordType === 'password' ? 'text' : 'password');
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await userService.loginUser({ email, password });
      console.log('Login response:', response);
      const { token, user } = response;

      localStorage.setItem('token', token);
      setIsLoggedIn(true);
      setFirstName(user.firstName);
      await checkLoginStatus();
      setIsModalOpen(true);
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid credentials. Please try again.');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    router.push('/');
  };

  return (
    <>
      <Grid className="login-page" fullWidth>
        <Column lg={7} md={7} sm={4} className="login-page__left-column">
          <div className="inner-wrapper">
            <div className="login-page__heading">
              <h1>Log in to Medi-C</h1>
            </div>

            <div className="form-wrapper">
              <Form onSubmit={handleLogin}>
                <TextInput
                  id="email"
                  invalidText="Medi-C ID is required"
                  labelText="Email"
                  placeholder="username@medi-c.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="pw_input">
                  <TextInput
                    className="password-margin"
                    id="password"
                    labelText="Password"
                    type={passwordType}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    className="pw-toggle-btn"
                    kind="ghost"
                    size="small"
                    hasIconOnly
                    renderIcon={passwordType === 'password' ? View : ViewOff}
                    iconDescription={
                      passwordType === 'password'
                        ? 'Show password'
                        : 'Hide password'
                    }
                    onClick={togglePasswordVisibility}
                  />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <Button
                  className="continueBtn"
                  type="submit"
                  kind="primary"
                  size="large-productive"
                  renderIcon={ArrowRight}
                >
                  Continue
                </Button>
              </Form>

              <div className="checkbox-row">
                <Checkbox labelText="Remember Me" id="remember-Me" />
                <Toggletip>
                  <ToggletipButton label="Show information">
                    <Information />
                  </ToggletipButton>
                  <ToggletipContent>
                    <p>
                      You can opt to have your ID remembered the next time you
                      access our website by checking the &quot;Remember Me&quot;
                      box. If you do not wish to have your ID remembered the
                      next time you access our website, leave the &quot;Remember
                      Me&quot; box unchecked.
                    </p>
                  </ToggletipContent>
                </Toggletip>
              </div>
            </div>

            <div className="login-page__text">
              <span className="account-text">Don&apos;t have an account? </span>
              <Button
                type="submit"
                kind="tertiary"
                size="large-productive"
                renderIcon={ArrowRight}
                onClick={() => router.push('/register')}
              >
                Join Now!
              </Button>
              <div className="forgot-section">
                <span>Forgot ID? </span>
                <a href="">Contact the help desk</a>
              </div>
            </div>
          </div>
        </Column>

        <Column lg={9} md={7} sm={4} className="right-column">
          <img
            src="/images/login.gif"
            alt="login image ambient animation loop"
          ></img>
        </Column>
      </Grid>

      <Modal
        open={isModalOpen}
        modalHeading="Login Successful"
        onRequestClose={handleModalClose}
        passiveModal
      >
        <p>Welcome back! You have successfully logged in.</p>
      </Modal>
    </>
  );
}
