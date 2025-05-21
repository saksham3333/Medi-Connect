'use client';

import moment from 'moment';
import userService from '@/services/userService';
import { useAuth } from '@/context/AuthContext';

import React, { useState } from 'react';
import {
  Grid,
  Column,
  Row,
  Breadcrumb,
  BreadcrumbItem,
  DatePicker,
  DatePickerInput,
  Button,
  DataTable,
  Tile,
  TableContainer,
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableSelectRow,
  TableCell,
  TableToolbar,
  TableToolbarSearch,
  TableToolbarContent,
  Modal,
  Pagination,
} from '@carbon/react';
import {
  ArrowRight,
  Stethoscope,
  Hospital,
  EventSchedule,
} from '@carbon/icons-react';

const PatientAppointmentPage = () => {
  const { userId } = useAuth();
  const [selectedDate, setSelectedDate] = useState(null);
  const [formattedDate, setFormattedDate] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [rows, setRows] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [firstRowIndex, setFirstRowIndex] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(5);

  const headers = [
    { key: 'physician', header: 'Physician' },
    { key: 'hospital', header: 'Location' },
    { key: 'sessionTime', header: 'Session Time' },
    { key: 'interval', header: 'Duration' },
  ];

  const handleSelect = () => {
    const selectedRow = rows.find((row) => row.id === selectedRowId);
    if (selectedRow) {
      setSelectedSlot(selectedRow);
    } else {
      alert('Please select a slot before confirming.');
    }
  };

  const handleConfirm = async () => {
    if (!selectedSlot) {
      alert('Please select a slot before confirming.');
      return;
    }
    try {
      const scheduleId = selectedSlot.scheduleId;
      const slotId = selectedSlot.slotId;
      const patientId = userId;

      await userService.bookSlot(scheduleId, slotId, patientId);

      console.log('handle confirm selected Slot: ', selectedSlot);
      console.log('handle confirm scheduleId: ', scheduleId);
      console.log('handle confirm slotId: ', slotId);
      console.log('handle confirm patientId: ', patientId);

      setShowModal(true);
      setSelectedSlot(null);
      setCurrentPageSize(5);
      setSelectedRowId(null);
      setShowTable(false);
    } catch (error) {
      console.error('Error confirming appointment:', error);
      if (error.response && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert('Failed to confirm appointment. Please try again.');
      }
    }
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date[0]);
    setFormattedDate(moment(date[0]).format('MM/DD/YYYY'));
    setSelectedSlot(null);
    setCurrentPageSize(5);
    setSelectedRowId(null);
    setShowTable(false);
  };

  const handleCheckSlots = async () => {
    if (selectedDate) {
      try {
        console.log(
          'HandleCheckSlots: Sending GET request to /users/schedules with date:',
          selectedDate
        );

        const response = await userService.getSchedulesByDate(selectedDate);

        if (!response || !response.length) {
          console.log('No schedules found for this date.');
          setRows([]);
          setShowTable(true);
          return;
        }

        const availableSlots = response.flatMap((schedule, scheduleIndex) =>
          schedule.slots
            .filter((slot) => slot.status === 'Available')
            .map((slot, slotIndex) => ({
              id: `${scheduleIndex}-${slotIndex}`,
              scheduleId: schedule._id,
              slotId: slot._id,
              physician: `${schedule.physicianId.firstName} ${schedule.physicianId.lastName}`,
              hospital: `${schedule.location}`,
              sessionTime: `${slot.startTime} ~ ${slot.endTime}`,
              interval: `${formatInterval(slot.duration)}`,
            }))
        );

        setRows(availableSlots);
        setShowTable(true);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        alert('Failed to load available slots');
      }
    } else {
      alert('Please select a date first');
    }
  };

  const filteredRows = rows.filter((row) =>
    Object.values(row).some((value) =>
      value.toString().toLowerCase().includes(searchValue.toLowerCase())
    )
  );

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const currentRows = filteredRows.slice(
    firstRowIndex,
    firstRowIndex + currentPageSize
  );

  const formatInterval = (interval) => {
    switch (interval) {
      case 30:
        return '30 mins';
      case 60:
        return '1 hr';
      case 90:
        return '1.5 hrs';
      case 120:
        return '2 hrs';
      default:
        return `${interval} mins`;
    }
  };

  return (
    <>
      <Grid className="appointment-grid">
        <Column lg={16} md={8} sm={4} className="appointment-page__banner">
          <Breadcrumb noTrailingSlash aria-label="Page navigation">
            <BreadcrumbItem>
              <a href="/">Home</a>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>Appointment</BreadcrumbItem>
          </Breadcrumb>
          <h1>Make Appointments (Patient)</h1>
        </Column>

        <Column lg={4} md={5} sm={3} className="appointment-page__date-select">
          <Tile className="date-picker__tile">
            <h4>Step 1.Select Date</h4>
            <DatePicker
              className="appointment__date-picker"
              datePickerType="single"
              minDate={moment().format('MM/DD/YYYY')}
              maxDate={moment().add(1, 'year').format('MM/DD/YYYY')}
              onChange={handleDateChange}
            >
              <DatePickerInput
                placeholder="mm/dd/yyyy"
                labelText="Pick a date for available slots"
                id="date-picker-single"
                size="lg"
              />
            </DatePicker>
            <Button
              kind="primary"
              size="lg"
              renderIcon={ArrowRight}
              onClick={handleCheckSlots}
            >
              Check Available Slots
            </Button>
          </Tile>
        </Column>

        <Column lg={8} md={5} sm={3} className="appointment-page__slot-select">
          <Tile className="slot-table__tile">
            {showTable ? (
              rows.length > 0 ? (
                <>
                  <DataTable
                    rows={currentRows}
                    headers={headers}
                    radio
                    isSortable
                  >
                    {({
                      rows,
                      headers,
                      getHeaderProps,
                      getRowProps,
                      getSelectionProps,
                      getTableProps,
                      getTableContainerProps,
                      getToolbarProps,
                      batchActionProps,
                    }) => (
                      <TableContainer
                        title="Step 2.Select Time Slot"
                        description={`Selected Date: ${formattedDate}`}
                        {...getTableContainerProps()}
                      >
                        <TableToolbar {...getToolbarProps()}>
                          <TableToolbarContent aria-hidden={batchActionProps}>
                            <TableToolbarSearch
                              tabIndex={batchActionProps ? -1 : 0}
                              onChange={handleSearchChange}
                              value={searchValue}
                            />
                            <Button
                              tabIndex={batchActionProps ? -1 : 0}
                              onClick={handleSelect}
                              kind="primary"
                              renderIcon={ArrowRight}
                            >
                              Select
                            </Button>
                          </TableToolbarContent>
                        </TableToolbar>
                        <Table {...getTableProps()} aria-label="Slot table">
                          <TableHead>
                            <TableRow>
                              <th scope="col" />
                              {headers.map((header, i) => (
                                <TableHeader
                                  key={i}
                                  {...getHeaderProps({
                                    header,
                                    isSortable: true,
                                  })}
                                >
                                  {header.header}
                                </TableHeader>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {rows.map((row, i) => (
                              <TableRow
                                key={i}
                                {...getRowProps({
                                  row,
                                })}
                              >
                                <TableSelectRow
                                  {...getSelectionProps({
                                    row,
                                    onChange: () => setSelectedRowId(row.id),
                                  })}
                                />
                                {row.cells.map((cell) => (
                                  <TableCell key={cell.id}>
                                    {cell.value}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </DataTable>
                  <Pagination
                    totalItems={filteredRows.length}
                    backwardText="Previous page"
                    forwardText="Next page"
                    pageSize={currentPageSize}
                    pageSizes={[5, 10, 15]}
                    itemsPerPageText="Items per page"
                    onChange={({ page, pageSize }) => {
                      setCurrentPageSize(pageSize);
                      setFirstRowIndex(pageSize * (page - 1));
                    }}
                  />
                </>
              ) : (
                <>
                  <h4>Step 2.Select Time Slot</h4>
                  <p className="helper-txt">
                    There is no available slots for this date
                  </p>
                </>
              )
            ) : (
              <>
                <h4>Step 2.Select Time Slot</h4>
                <p className="helper-txt">Please select date first</p>
              </>
            )}
          </Tile>
        </Column>

        <Column lg={4} md={5} sm={3} className="appointment-page__confirm">
          <Tile className="confirmation__tile">
            <h4>Step 3.Confirm Appointment</h4>
            {selectedSlot ? (
              <>
                <Row>
                  <p className="helper-txt">
                    Please review your appointment details carefully before
                    confirming
                  </p>
                </Row>

                <Row className="confirmation__row">
                  <Stethoscope size="32" />
                  <p className="info-txt">Dr. {selectedSlot.physician}</p>
                </Row>

                <Row className="confirmation__row">
                  <Hospital size="32" />
                  <p className="info-txt">{selectedSlot.hospital}</p>
                </Row>

                <Row className="confirmation__row">
                  <EventSchedule size="32" />
                  <p className="info-txt">{formattedDate}</p>
                  <p className="info-txt">{selectedSlot.sessionTime}</p>
                </Row>
                <Button
                  className="confirmation__btn"
                  kind="primary"
                  onClick={handleConfirm}
                  renderIcon={ArrowRight}
                >
                  Confirm Appointment
                </Button>
              </>
            ) : (
              <p className="helper-txt">Please select available slot first</p>
            )}
          </Tile>
        </Column>

        <Column lg={16} md={8} sm={4} className="appointment-page__image-row">
          <img
            src="/images/patient-appointment_1.png"
            alt="Cat Astronaut Illustration Left"
            className="appointment-page__illo"
          />
          <img
            src="/images/patient-appointment_2.png"
            alt="Alien Spaceship Illustration"
            className="appointment-page__illo"
          />
          <img
            src="/images/patient-appointment_3.png"
            alt="Cat Astronaut Illustration Right"
            className="appointment-page__illo"
          />
        </Column>
      </Grid>

      <Modal
        open={showModal}
        modalHeading="Appointment Confirmed"
        onRequestClose={() => setShowModal(false)}
        passiveModal
      >
        <p>Your appointment has been successfully booked!</p>
      </Modal>
    </>
  );
};

export default PatientAppointmentPage;
