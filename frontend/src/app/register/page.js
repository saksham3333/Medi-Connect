'use client';

import userService from '@/services/userService';

import moment from 'moment';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import React, { useState } from 'react';
import {
  Button,
  TextInput,
  Form,
  FormLabel,
  Tooltip,
  RadioButtonGroup,
  RadioButton,
  DatePicker,
  DatePickerInput,
  Grid,
  Column,
  Modal,
} from '@carbon/react';
import { ArrowRight, View, ViewOff, Information } from '@carbon/icons-react';

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordType, setPasswordType] = useState('password');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [gender, setGender] = useState('');

  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [firstNameError, setFirstNameError] = useState(false);
  const [lastNameError, setLastNameError] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [genderError, setGenderError] = useState(false);
  const [roleError, setRoleError] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordType(passwordType === 'password' ? 'text' : 'password');
  };

  const emailPattern = /^[a-zA-Z0-9._%+-]+@medi-c\.com$/;

  const handleRegister = async (e) => {
    e.preventDefault();

    const isEmailValid = emailPattern.test(email) && email !== '';
    setEmailError(!isEmailValid);

    if (!isEmailValid) {
      return;
    }

    const newUser = {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth,
      gender,
      role,
    };

    setEmailError(!email);
    setPasswordError(!password);
    setFirstNameError(!firstName);
    setLastNameError(!lastName);
    setDateError(!dateOfBirth);
    setGenderError(!gender);
    setRoleError(!role);

    console.log('Submitting registration data:', {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth,
      gender,
      role,
    });

    try {
      const response = await userService.registerUser(newUser);
      console.log(response);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error during registration:', error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    router.push('/login');
  };

  return (
    <>
      <Grid className="register-page" fullWidth>
        <Column lg={7} md={4} sm={4} className="register-page__lc">
          <div className="lc-wrapper">
            <div className="register-page__heading">
              <h1>Create an ID</h1>
              <p>
                Already have a Medi-C account? <Link href="/login">Log in</Link>
              </p>
            </div>

            <div className="lc-wrapper">
              <Form onSubmit={handleRegister}>
                <TextInput
                  id="userid"
                  invalid={emailError}
                  invalidText="ID is required and must follow 'username@medi-c.com' format"
                  labelText="ID"
                  placeholder="username@medi-c.com"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(!emailPattern.test(e.target.value));
                  }}
                  className="form-input-margin"
                />

                <div className="pw_label-with-tooltip">
                  <FormLabel>Password</FormLabel>
                  <Tooltip
                    align="bottom"
                    label="Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."
                  >
                    <button className="cds--tooltip__trigger" type="button">
                      <Information />
                    </button>
                  </Tooltip>
                </div>

                <div className="pw_input">
                  <TextInput
                    id="password"
                    invalid={passwordError}
                    invalidText="Password is required and must include at least 8 characters, an uppercase, lowercase, number, and special character"
                    type={passwordType}
                    placeholder="8+ characters, upper, lower, number, special character"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                  />
                  <Button
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

                <TextInput
                  id="first-name"
                  invalid={firstNameError}
                  invalidText="First name is required"
                  labelText="First Name"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="form-input-margin"
                />

                <TextInput
                  id="last-name"
                  invalid={lastNameError}
                  invalidText="Last name is required"
                  labelText="Last Name"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="form-input-margin"
                />

                <TextInput
                  id="phone-number"
                  labelText="Phone Number (Optional)"
                  placeholder="0411-222-333"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="form-input-margin"
                />

                <DatePicker
                  datePickerType="single"
                  minDate={moment().subtract(100, 'years').format('MM/DD/YYYY')}
                  maxDate={moment().format('MM/DD/YYYY')}
                  onChange={(eventOrDates) => {
                    setDateOfBirth(eventOrDates[0]);
                    setDateError(!eventOrDates[0]);
                  }}
                  className="form-input-margin date-picker"
                >
                  <DatePickerInput
                    id="date-picker"
                    invalid={dateError}
                    invalidText="Date of birth is required"
                    placeholder="mm/dd/yyyy"
                    labelText="Date of Birth"
                    size="lg"
                  />
                </DatePicker>

                <RadioButtonGroup
                  legendText="Select your Gender"
                  name="gender-status"
                  defaultSelected={gender}
                  onChange={(value) => setGender(value)}
                  invalid={genderError}
                  invalidText="Select one"
                  className="form-input-margin"
                >
                  <RadioButton labelText="Male" value="male" id="male" />
                  <RadioButton labelText="Female" value="female" id="female" />
                  <RadioButton labelText="Other" value="other" id="other" />
                </RadioButtonGroup>

                <RadioButtonGroup
                  legendText="Select your Role"
                  name="role-status"
                  defaultSelected={role}
                  onChange={(value) => setRole(value)}
                  invalid={roleError}
                  invalidText="Select one"
                  className="form-input-margin"
                >
                  <RadioButton
                    labelText="Patient"
                    value="Patient"
                    id="patient"
                  />
                  <RadioButton
                    labelText="Physician"
                    value="Physician"
                    id="physician"
                  />
                </RadioButtonGroup>

                <Button
                  className="form-input-margin"
                  type="submit"
                  kind="primary"
                  size="large-productive"
                  renderIcon={ArrowRight}
                >
                  Submit
                </Button>
              </Form>
            </div>
          </div>
        </Column>

        <Column lg={9} md={4} sm={4} className="register-page__rc">
          <img src="/images/register_room.png" alt="register image room"></img>
        </Column>
      </Grid>
      <Modal
        open={isModalOpen}
        modalHeading="Welcome to Medi Connect!"
        onRequestClose={handleModalClose}
        passiveModal
      >
        <p>Your account is now ready to use.</p>
      </Modal>
    </>
  );
}
