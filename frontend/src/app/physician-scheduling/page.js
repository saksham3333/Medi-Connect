'use client';

import moment from 'moment';
import userService from '@/services/userService';
import { useAuth } from '@/context/AuthContext';

import React, { useState, useEffect } from 'react';
import {
  Grid,
  Column,
  Row,
  Breadcrumb,
  BreadcrumbItem,
  DatePicker,
  DatePickerInput,
  TextInput,
  Tile,
  TimePicker,
  TimePickerSelect,
  SelectItem,
  Dropdown,
  Checkbox,
  Modal,
  Button,
} from '@carbon/react';
import { ArrowRight } from '@carbon/icons-react';

const PhysicianSchedulingPage = () => {
  const { userId } = useAuth();
  const [selectedDate, setSelectedDate] = useState(null);
  const [hospitalName, setHospitalName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [startTimePeriod, setStartTimePeriod] = useState('AM');
  const [endTimePeriod, setEndTimePeriod] = useState('AM');
  const [interval, setInterval] = useState('');
  const [schedules, setSchedules] = useState([]);

  const [breakTimeEnabled, setBreakTimeEnabled] = useState(false);
  const [breakStartTime, setBreakStartTime] = useState('');
  const [breakEndTime, setBreakEndTime] = useState('');
  const [breakStartPeriod, setBreakStartPeriod] = useState('AM');
  const [breakEndPeriod, setBreakEndPeriod] = useState('AM');

  const [showModal, setShowModal] = useState(false);
  const [showTimeSlots, setShowTimeSlots] = useState(false);

  const [startTimeInvalid, setStartTimeInvalid] = useState(false);
  const [endTimeInvalid, setEndTimeInvalid] = useState(false);
  const [breakStartTimeInvalid, setBreakStartTimeInvalid] = useState(false);
  const [breakEndTimeInvalid, setBreakEndTimeInvalid] = useState(false);

  const [breakStartTimeError, setBreakStartTimeError] = useState('');
  const [breakEndTimeError, setBreakEndTimeError] = useState('');

  const [hospitalNameInvalid, setHospitalNameInvalid] = useState(false);
  const [intervalInvalid, setIntervalInvalid] = useState(false);
  const [startTimeNotExist, setStartTimeNotExist] = useState(false);
  const [endTimeNotExist, setEndTimeNotExist] = useState(false);

  const handleSaveSchedule = async () => {
    if (!schedules.length) {
      alert('No schedules to save');
      return;
    }

    const scheduleData = {
      date: selectedDate,
      location: hospitalName,
      slots: schedules.map((slot) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        duration: slot.duration,
        status: 'Available',
      })),
      breakStartTime: breakStartTime,
      breakEndTime: breakEndTime,
      interval,
    };

    console.log('User ID:', userId);
    console.log('Selected Date:', selectedDate);
    console.log('Slots:', schedules);
    console.log('Start Time:', startTime);
    console.log('End Time:', endTime);
    console.log('Break Start Time:', breakStartTime);
    console.log('Break End Time:', breakEndTime);
    console.log('Interval:', interval);

    try {
      const response = await userService.saveSchedule(userId, scheduleData);
      console.log('Schedule saved successfully:', response);
      setShowModal(true);
      setSelectedDate(null);
      setShowTimeSlots(false);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert('A schedule already exists on the selected date.');
      } else {
        console.error('Error saving schedule:', error);
        alert('Failed to save schedule');
      }
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(moment(date[0]).format('MM/DD/YYYY'));
    setShowTimeSlots(false);
  };

  const handleProceedWithDate = () => {
    if (selectedDate) {
      setShowTimeSlots(true);
      setHospitalName('');
      setStartTime('');
      setEndTime('');
      setStartTimePeriod('AM');
      setEndTimePeriod('AM');
      setBreakTimeEnabled(false);
      setBreakStartTime('');
      setBreakEndTime('');
      setBreakStartPeriod('AM');
      setBreakEndPeriod('AM');
      setInterval('');
      setSchedules([]);
      setHospitalNameInvalid(false);
      setIntervalInvalid(false);
      setStartTimeNotExist(false);
      setEndTimeNotExist(false);
    } else {
      alert('Please select a date first');
    }
  };

  const validateTimes = () => {
    const sessionStart = moment(`${startTime} ${startTimePeriod}`, 'hh:mm A');
    const sessionEnd = moment(`${endTime} ${endTimePeriod}`, 'hh:mm A');
    const breakStart =
      breakTimeEnabled && breakStartTime
        ? moment(`${breakStartTime} ${breakStartPeriod}`, 'hh:mm A')
        : null;
    const breakEnd =
      breakTimeEnabled && breakEndTime
        ? moment(`${breakEndTime} ${breakEndPeriod}`, 'hh:mm A')
        : null;

    console.log('Session Start:', sessionStart.format('hh:mm A'));
    console.log('Session End:', sessionEnd.format('hh:mm A'));
    if (breakStart) console.log('Break Start:', breakStart.format('hh:mm A'));
    if (breakEnd) console.log('Break End:', breakEnd.format('hh:mm A'));

    let hasError = false;

    if (sessionStart.isSameOrAfter(sessionEnd)) {
      setStartTimeInvalid(true);
      setEndTimeInvalid(true);
      hasError = true;
    } else {
      setStartTimeInvalid(false);
      setEndTimeInvalid(false);
    }

    if (breakTimeEnabled && breakStart && breakEnd) {
      if (
        breakStart.isBefore(sessionStart) ||
        breakStart.isSameOrAfter(sessionEnd)
      ) {
        console.error('Break start time must be within session time range');
        setBreakStartTimeInvalid(true);
        setBreakStartTimeError(
          'Break start time must be within session time range'
        );
        hasError = true;
      } else {
        setBreakStartTimeInvalid(false);
        setBreakStartTimeError('');
      }

      if (
        breakEnd.isAfter(sessionEnd) ||
        breakEnd.isSameOrBefore(sessionStart)
      ) {
        setBreakEndTimeInvalid(true);
        setBreakEndTimeError(
          'Break end time must be within session time range'
        );
        hasError = true;
      } else {
        setBreakEndTimeInvalid(false);
        setBreakEndTimeError('');
      }

      if (breakStart && breakEnd && breakStart.isSameOrAfter(breakEnd)) {
        setBreakStartTimeInvalid(true);
        setBreakEndTimeInvalid(true);
        setBreakStartTimeError(
          'Break start time must be before break end time'
        );
        setBreakEndTimeError('Break end time must be after break start time');
        hasError = true;
      } else if (!hasError) {
        setBreakStartTimeInvalid(false);
        setBreakEndTimeInvalid(false);
        setBreakStartTimeError('');
        setBreakEndTimeError('');
      }
    }

    return !hasError;
  };

  const handleStartTimeChange = (event) => {
    setStartTime(event.target.value);
    validateTimes();
  };

  const handleEndTimeChange = (event) => {
    setEndTime(event.target.value);
    validateTimes();
  };

  const handleStartTimePeriodChange = (event) => {
    setStartTimePeriod(event.target.value);
    validateTimes();
  };

  const handleEndTimePeriodChange = (event) => {
    setEndTimePeriod(event.target.value);
    validateTimes();
  };

  const handleIntervalChange = (selectedItem) => {
    const selectedValue = selectedItem.selectedItem;
    let minutes;

    switch (selectedValue) {
      case '30 mins':
        minutes = 30;
        break;
      case '1 hour':
        minutes = 60;
        break;
      case '1.5 hours':
        minutes = 90;
        break;
      case '2 hours':
        minutes = 120;
        break;
      default:
        minutes = 30;
    }

    setInterval(minutes);
    console.log('Interval in minutes:', minutes);
  };

  const handleBreakTimeToggle = () => {
    setBreakTimeEnabled(!breakTimeEnabled);
  };

  const handleBreakStartTimeChange = (event) => {
    setBreakStartTime(event.target.value);
    validateTimes();
  };

  const handleBreakEndTimeChange = (event) => {
    setBreakEndTime(event.target.value);
    validateTimes();
  };

  const handleBreakStartPeriodChange = (event) => {
    setBreakStartPeriod(event.target.value);
    validateTimes();
  };

  const handleBreakEndPeriodChange = (event) => {
    setBreakEndPeriod(event.target.value);
    validateTimes();
  };

  const generateSchedule = () => {
    let hasError = false;
    const isTimesValid = validateTimes();

    if (!isTimesValid) {
      hasError = true;
    }

    if (!hospitalName) {
      setHospitalNameInvalid(true);
      hasError = true;
    } else {
      setHospitalNameInvalid(false);
    }

    if (!interval) {
      setIntervalInvalid(true);
      hasError = true;
    } else {
      setIntervalInvalid(false);
    }

    if (!startTime) {
      setStartTimeNotExist(true);
      hasError = true;
    } else {
      setStartTimeNotExist(false);
    }

    if (!endTime) {
      setEndTimeNotExist(true);
      hasError = true;
    } else {
      setEndTimeNotExist(false);
    }

    if (hasError) {
      return;
    }

    console.log('Date: ', selectedDate);
    console.log('Start Time:', startTime);
    console.log('End Time:', endTime);
    console.log('Start Time Period:', startTimePeriod);
    console.log('End Time Period:', endTimePeriod);
    console.log('Interval:', interval);
    console.log('Break Time Enabled:', breakTimeEnabled);
    console.log('Break Time Start:', breakStartTime, breakStartPeriod);
    console.log('Break Time End:', breakEndTime, breakEndPeriod);

    const fullStartTime = `${startTime} ${startTimePeriod}`;
    const fullEndTime = `${endTime} ${endTimePeriod}`;
    console.log('Full Start Time:', fullStartTime);
    console.log('Full End Time:', fullEndTime);

    const generatedSchedules = [];
    let currentTime = moment(fullStartTime, 'hh:mm A');
    const endMoment = moment(fullEndTime, 'hh:mm A');

    const breakStart = breakTimeEnabled
      ? moment(`${breakStartTime} ${breakStartPeriod}`, 'hh:mm A')
      : null;
    const breakEnd = breakTimeEnabled
      ? moment(`${breakEndTime} ${breakEndPeriod}`, 'hh:mm A')
      : null;

    console.log(
      'Break Start Time (Full):',
      breakStart ? breakStart.format('hh:mm A') : 'None'
    );
    console.log(
      'Break End Time (Full):',
      breakEnd ? breakEnd.format('hh:mm A') : 'None'
    );

    while (currentTime.isBefore(endMoment)) {
      const nextTime = moment(currentTime).add(interval, 'minutes');

      console.log('Current Time:', currentTime.format('hh:mm A'));
      console.log('Next Time:', nextTime.format('hh:mm A'));

      if (
        breakTimeEnabled &&
        currentTime.isBefore(breakEnd) &&
        nextTime.isAfter(breakStart)
      ) {
        console.log(
          `Skipping ${currentTime.format('hh:mm A')} - ${nextTime.format('hh:mm A')} due to break`
        );

        currentTime = moment(breakEnd);
        continue;
      }
      if (nextTime.isAfter(endMoment)) {
        console.log(
          `Skipping ${currentTime.format('hh:mm A')} - ${nextTime.format('hh:mm A')} as it exceeds end time`
        );
        break;
      }

      const slot = {
        startTime: currentTime.format('hh:mm A'),
        endTime: nextTime.format('hh:mm A'),
        duration: interval,
      };

      console.log('Adding Schedule:', slot);
      generatedSchedules.push(slot);

      currentTime = nextTime;
    }

    console.log('Generated Schedules:', generatedSchedules);
    setSchedules(generatedSchedules);
  };

  useEffect(() => {
    if (
      startTime &&
      endTime &&
      (!breakTimeEnabled || (breakStartTime && breakEndTime))
    ) {
      validateTimes();
    }
  }, [
    startTime,
    endTime,
    startTimePeriod,
    endTimePeriod,
    breakStartTime,
    breakEndTime,
    breakStartPeriod,
    breakEndPeriod,
  ]);

  return (
    <>
      <Grid className="scheduling-grid">
        <Column lg={16} md={8} sm={4} className="scheduling-page__banner">
          <Breadcrumb noTrailingSlash aria-label="Page navigation">
            <BreadcrumbItem>
              <a href="/">Home</a>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>Scheduling</BreadcrumbItem>
          </Breadcrumb>
          <h1>Create Your Schedule (Physician)</h1>
        </Column>

        <Column lg={4} md={5} sm={3} className="scheduling-page__date-select">
          <Tile className="date-picker__tile">
            <h4>Step 1.Select Date</h4>
            <DatePicker
              className="scheduling__date-picker"
              datePickerType="single"
              minDate={moment().format('MM/DD/YYYY')}
              maxDate={moment().add(1, 'year').format('MM/DD/YYYY')}
              onChange={handleDateChange}
            >
              <DatePickerInput
                placeholder="mm/dd/yyyy"
                labelText="Choose a Date to view available time slots"
                id="date-picker-single"
                size="lg"
              />
            </DatePicker>
            <Button
              kind="primary"
              size="lg"
              renderIcon={ArrowRight}
              onClick={handleProceedWithDate}
            >
              Proceed with Selected Date
            </Button>
          </Tile>
        </Column>

        <Column lg={8} md={5} sm={3} className="scheduling-page__detail-select">
          <Tile className="detail-select__tile">
            <h4>Step 2.Select Time Slots</h4>

            <p className="helper-txt">
              {showTimeSlots
                ? selectedDate
                  ? `Selected Date: ${selectedDate}`
                  : 'Please choose the time details to create your schedule'
                : 'Please select a date first'}
            </p>

            {showTimeSlots && (
              <>
                <TextInput
                  className="location-input"
                  id="location-input"
                  labelText="Location"
                  placeholder="Please enter the name of your hospital"
                  invalid={hospitalNameInvalid}
                  invalidText="Location is required"
                  onChange={(e) => setHospitalName(e.target.value)}
                  value={hospitalName}
                />
                <Row className="time-picker__row">
                  <TimePicker
                    className="detail__time-select"
                    id="start-time"
                    labelText="Start Time"
                    invalid={startTimeNotExist || startTimeInvalid}
                    invalidText={
                      startTimeNotExist
                        ? 'Start time is required'
                        : startTimeInvalid
                          ? 'Start time must be before end time'
                          : ''
                    }
                    onChange={handleStartTimeChange}
                  >
                    <TimePickerSelect
                      labelText="AM/PM"
                      onChange={handleStartTimePeriodChange}
                    >
                      <SelectItem value="AM" text="AM" />
                      <SelectItem value="PM" text="PM" />
                    </TimePickerSelect>
                  </TimePicker>
                  <TimePicker
                    className="detail__time-select"
                    id="end-time"
                    labelText="End Time"
                    invalid={endTimeNotExist || endTimeInvalid}
                    invalidText={
                      endTimeNotExist
                        ? 'End time is required'
                        : endTimeInvalid
                          ? 'End time must be after start time'
                          : ''
                    }
                    onChange={handleEndTimeChange}
                  >
                    <TimePickerSelect
                      labelText="AM/PM"
                      onChange={handleEndTimePeriodChange}
                    >
                      <SelectItem value="AM" text="AM" />
                      <SelectItem value="PM" text="PM" />
                    </TimePickerSelect>
                  </TimePicker>
                </Row>

                <Dropdown
                  className="detail__interval-dropdown"
                  id="interval-dropdown"
                  label="Choose duration"
                  titleText="Duration"
                  invalid={intervalInvalid}
                  invalidText="Duration is required"
                  items={['30 mins', '1 hour', '1.5 hours', '2 hours']}
                  onChange={handleIntervalChange}
                />

                <Checkbox
                  labelText="Include Break Time (optional)"
                  id="break-time-checkbox"
                  checked={breakTimeEnabled}
                  onChange={handleBreakTimeToggle}
                />

                {breakTimeEnabled && (
                  <Row className="time-picker__row">
                    <TimePicker
                      className="detail__time-select"
                      id="break-start-time"
                      labelText="Break Start Time"
                      invalid={breakStartTimeInvalid}
                      invalidText={breakStartTimeError}
                      onChange={handleBreakStartTimeChange}
                    >
                      <TimePickerSelect
                        id="break-start-time-picker-select-1"
                        labelText="AM/PM"
                        onChange={handleBreakStartPeriodChange}
                      >
                        <SelectItem value="AM" text="AM" />
                        <SelectItem value="PM" text="PM" />
                      </TimePickerSelect>
                    </TimePicker>
                    <TimePicker
                      className="detail__time-select"
                      id="break-end-time"
                      labelText="Break End Time"
                      invalid={breakEndTimeInvalid}
                      invalidText={breakEndTimeError}
                      onChange={handleBreakEndTimeChange}
                    >
                      <TimePickerSelect
                        id="break-end-time-picker-select-1"
                        labelText="AM/PM"
                        onChange={handleBreakEndPeriodChange}
                      >
                        <SelectItem value="AM" text="AM" />
                        <SelectItem value="PM" text="PM" />
                      </TimePickerSelect>
                    </TimePicker>
                  </Row>
                )}

                <Button
                  className="detail__confirm-btn"
                  kind="primary"
                  size="lg"
                  onClick={generateSchedule}
                  renderIcon={ArrowRight}
                >
                  Confirm Time Slots
                </Button>
              </>
            )}
          </Tile>
        </Column>

        <Column lg={4} md={5} sm={3} className="scheduling-page__confirm">
          <Tile className="confirmation__tile">
            <h4>Step 3.Confirm Your Schedule</h4>
            {showTimeSlots && schedules.length > 0 ? (
              <>
                <Row>
                  <p className="helper-txt">
                    {selectedDate
                      ? `Selected Date: ${selectedDate}`
                      : 'Review the following schedule before confirming'}
                  </p>
                </Row>
                {schedules.map((schedule, index) => (
                  <Row key={index} className="confirmation__row">
                    {`${schedule.startTime} ~ ${schedule.endTime}`}
                  </Row>
                ))}
                <Button
                  className="confirmation__btn"
                  kind="primary"
                  onClick={handleSaveSchedule}
                  renderIcon={ArrowRight}
                >
                  Create Schedule
                </Button>
              </>
            ) : (
              <p className="helper-txt">
                Please select a date and time range first
              </p>
            )}
          </Tile>
        </Column>

        <Column lg={16} md={8} sm={4} className="Scheduling-page__image-row">
          <img
            src="/images/physician-scheduling_1.png"
            alt="Space Alien Illustration Left"
            className="scheduling-page__illo"
          />
          <img
            src="/images/physician-scheduling_2.png"
            alt="Human Spaceship Illustration"
            className="scheduling-page__illo"
          />
          <img
            src="/images/physician-scheduling_3.png"
            alt="Space Alien Illustration Right"
            className="scheduling-page__illo"
          />
        </Column>

        <Modal
          open={showModal}
          modalHeading="Schedule Confirmed"
          onRequestClose={() => setShowModal(false)}
          passiveModal
        >
          <p>Your schedule slots have been successfully added!</p>
        </Modal>
      </Grid>
    </>
  );
};

export default PhysicianSchedulingPage;
