'use client';

import moment from 'moment';
import userService from '@/services/userService';
import { useAuth } from '@/context/AuthContext';

import React, { useState, useEffect } from 'react';
import {
  Grid,
  Column,
  Button,
  Breadcrumb,
  BreadcrumbItem,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableContainer,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Pagination,
  Modal,
  TextArea,
} from '@carbon/react';
import {
  TrashCan,
  Checkmark,
  ChartCustom,
  Document,
  Edit,
} from '@carbon/icons-react';

const PhysicianAppointmentPage = () => {
  const { userId } = useAuth();
  const [appointments, setAppointments] = useState({
    available: [],
    pendingOrBooked: [],
    finished: [],
  });
  const [activeTab, setActiveTab] = useState('Available');
  const [availablePage, setAvailablePage] = useState(1);
  const [availableItemsPerPage, setAvailableItemsPerPage] = useState(5);
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingItemsPerPage, setPendingItemsPerPage] = useState(5);
  const [finishedPage, setFinishedPage] = useState(1);
  const [finishedItemsPerPage, setFinishedItemsPerPage] = useState(5);
  const [slotMap, setSlotMap] = useState({});
  const [showDeleteSlotConfirmModal, setShowDeleteSlotConfirmModal] =
    useState(false);
  const [showDeleteSlotSuccessModal, setShowDeleteSlotSuccessModal] =
    useState(false);
  const [showBookingConfirmModal, setShowBookingConfirmModal] = useState(false);
  const [showBookingSuccessModal, setShowBookingSuccessModal] = useState(false);
  const [selectedAvailableSlot, setSelectedAvailableSlot] = useState(null);
  const [selectedPendingSlot, setSelectedPendingSlot] = useState(null);
  const [showPatientInfoModal, setShowPatientInfoModal] = useState(false);
  const [selectedPatientData, setSelectedPatientData] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showNoteSuccessModal, setShowNoteSuccessModal] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(null);
  const [currentPatientId, setCurrentPatientId] = useState(null);
  const [noteType, setNoteType] = useState('');
  const [showCompleteConfirmModal, setShowCompleteConfirmModal] =
    useState(false);
  const [showCompleteSuccessModal, setShowCompleteSuccessModal] =
    useState(false);

  const userInfoHeaders = [
    { key: 'label', header: 'Label' },
    { key: 'value', header: 'Information' },
  ];

  const allergyDetailsHeaders = [
    { key: 'label', header: 'Name' },
    { key: 'category', header: 'Category' },
    { key: 'criticality', header: 'Criticality' },
    { key: 'recordedDate', header: 'Recorded Date' },
    { key: 'onsetDate', header: 'Onset Date' },
    { key: 'edit', header: 'Diagnosis' },
  ];

  const vaccinationDetailsHeaders = [
    { key: 'code', header: 'Vaccine Code' },
    { key: 'status', header: 'Status' },
    { key: 'date', header: 'Date' },
    { key: 'dose', header: 'Dose Number' },
    { key: 'provider', header: 'Provider' },
    { key: 'edit', header: 'Diagnosis' },
  ];

  const handleTabChange = (index) => {
    const tabNames = ['Available', 'Scheduled', 'Completed'];
    setActiveTab(tabNames[index]);
  };

  const handleNoteChange = (e) => {
    console.log('Current note content:', e.target.value);
    setNoteContent(e.target.value);
  };

  const openNoteModal = (type, index, existingNote) => {
    console.log('Opening Note Modal with note:', existingNote);
    setShowPatientInfoModal(false);
    setNoteContent(existingNote || '');
    setCurrentNoteIndex(index);
    setNoteType(type);
    setShowNoteModal(true);
  };

  const handleSaveNote = async () => {
    try {
      const id = selectedPatientData[noteType][currentNoteIndex].id;

      console.log('id?', id);
      console.log('patient?', selectedPatientData);
      console.log('note?', noteContent);

      if (noteType === 'allergies') {
        await userService.updateAllergyNote(currentPatientId, id, noteContent);
      } else if (noteType === 'vaccinations') {
        await userService.updateVaccinationNote(
          currentPatientId,
          id,
          noteContent
        );
      }

      setSelectedPatientData((prevData) => ({
        ...prevData,
        [noteType]: prevData[noteType].map((item, i) =>
          i === currentNoteIndex ? { ...item, note: noteContent } : item
        ),
      }));

      setShowNoteModal(false);
      setShowNoteSuccessModal(true);
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const openPatientInfoModal = async (
    patientInfo,
    bookedPatientId,
    scheduleId,
    slotId
  ) => {
    console.log('patient info: ', patientInfo.bookedBy);
    console.log('patientInfo bookedby Info:', bookedPatientId);
    console.log('slot Id?', slotId);
    console.log('schedule Id?', scheduleId);
    setCurrentPatientId(bookedPatientId);

    const formattedPatientData = [
      { id: '1', label: 'Name', value: patientInfo.name },
      { id: '2', label: 'Email', value: patientInfo.email },
      { id: '3', label: 'Phone', value: patientInfo.phoneNumber },
      { id: '4', label: 'Gender', value: patientInfo.gender },
      {
        id: '5',
        label: 'Birth Date',
        value: moment(patientInfo.dateOfBirth).format('DD-MM-YYYY'),
      },
    ];

    try {
      const allergies = await userService.getUserAllergies(bookedPatientId);
      const formattedAllergies = allergies.map((allergy) => ({
        key: allergy._id,
        id: allergy._id,
        label: allergy.name,
        category: allergy.category,
        criticality: allergy.criticality,
        recordedDate: moment(allergy.recordedDate).format('MM/DD/YYYY'),
        onsetDate: moment(allergy.onsetDateTime).format('MM/DD/YYYY'),
        note: allergy.note || '',
        isEditing: false,
      }));

      const vaccinations =
        await userService.getUserVaccinations(bookedPatientId);
      const formattedVaccinations = vaccinations.map((vaccination) => ({
        key: vaccination._id,
        id: vaccination._id,
        code: vaccination.vaccineCode,
        status: vaccination.status,
        date: moment(vaccination.date).format('MM/DD/YYYY'),
        dose: vaccination.doseNumber,
        provider: vaccination.provider,
        note: vaccination.note || '',
        isEditing: false,
      }));

      console.log('formatted allergy: ', formattedAllergies);
      console.log('formatted vac: ', formattedVaccinations);

      setSelectedPatientData({
        generalInfo: formattedPatientData,
        allergies: formattedAllergies,
        vaccinations: formattedVaccinations,
        slotId,
        scheduleId,
      });
      setShowPatientInfoModal(true);
    } catch (error) {
      console.error('Error fetching allergies or vaccinations:', error);
    }
  };

  const handleCompleteAppointment = () => {
    setShowCompleteConfirmModal(true);
  };

  const handleConfirmCompletion = async () => {
    try {
      console.log('patientId?', currentPatientId);
      console.log('scheduleId:', selectedPatientData.scheduleId);
      console.log('slotId?', selectedPatientData.slotId);

      await userService.updateSlotStatus(
        selectedPatientData.scheduleId,
        selectedPatientData.slotId,
        'Finished',
        currentPatientId
      );
      setAppointments((prevAppointments) => ({
        ...prevAppointments,
        pendingOrBooked: prevAppointments.pendingOrBooked.filter(
          (appt) => appt.slotId !== selectedPatientData.slotId
        ),
        finished: [
          ...prevAppointments.finished,
          {
            ...selectedPatientData,
            status: 'Finished',
          },
        ],
      }));

      setShowCompleteConfirmModal(false);
      setShowPatientInfoModal(false);
      setShowCompleteSuccessModal(true);
    } catch (error) {
      console.error('Failed to update appointment status:', error);
    }
  };

  const handleDeleteSlotClick = (scheduleId, slotId) => {
    setSelectedAvailableSlot({ scheduleId, slotId });
    setShowDeleteSlotConfirmModal(true);
  };

  const confirmDeleteSlot = async () => {
    if (selectedAvailableSlot) {
      try {
        await handleDeleteSchedule(
          selectedAvailableSlot.scheduleId,
          selectedAvailableSlot.slotId
        );
        setShowDeleteSlotConfirmModal(false);
        setShowDeleteSlotSuccessModal(true);
      } catch (error) {
        console.error('Error cancelling slot:', error);
      }
    }
  };

  const handleBookingConfirmClick = (scheduleId, slotId) => {
    setSelectedPendingSlot({ scheduleId, slotId });
    setShowBookingConfirmModal(true);
  };

  const confirmBooking = async () => {
    if (selectedPendingSlot) {
      try {
        await userService.updateSlotStatus(
          selectedPendingSlot.scheduleId,
          selectedPendingSlot.slotId,
          'Booked',
          userId
        );
        setAppointments((prevAppointments) => ({
          ...prevAppointments,
          pendingOrBooked: prevAppointments.pendingOrBooked.map((slot) =>
            slot.slotId === selectedPendingSlot.slotId &&
            slot.status === 'Pending'
              ? { ...slot, status: 'Booked' }
              : slot
          ),
        }));
        setShowBookingConfirmModal(false);
        setShowBookingSuccessModal(true);
      } catch (error) {
        console.error('Error updating slot status:', error);
      }
    }
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await userService.getPhysicianAppointments(userId);

        const available = [];
        const pendingOrBooked = [];
        const finished = [];
        const newSlotMap = {};

        response.forEach((appointment, index) => {
          const formattedAppointment = {
            ...appointment,
            original: appointment,
            id: `${appointment.scheduleId}-${appointment.slotId}-${index}`,
            patientId: appointment.patientInfo
              ? appointment.patientInfo.patientId
              : null,
            date: moment(appointment.date).format('YYYY-MM-DD'),
            sessionTime: `${appointment.startTime} - ${appointment.endTime}`,
          };

          newSlotMap[formattedAppointment.id] = appointment;

          switch (appointment.status) {
            case 'Available':
              available.push(formattedAppointment);
              break;
            case 'Pending':
              pendingOrBooked.push(formattedAppointment);
              break;
            case 'Booked':
              pendingOrBooked.push(formattedAppointment);
              break;
            case 'Finished':
              finished.push(formattedAppointment);
              break;
            default:
              break;
          }
        });

        setAppointments({
          available,
          pendingOrBooked,
          finished,
        });
        setSlotMap(newSlotMap);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    if (userId) fetchAppointments();
  }, [userId, activeTab, appointments]);

  const handleDeleteSchedule = async (scheduleId, slotId) => {
    console.log(
      'Deleting schedule with ID:',
      scheduleId,
      'and slot ID:',
      slotId
    );

    try {
      await userService.deleteScheduleSlot(scheduleId, slotId);
      setAppointments((prevAppointments) => ({
        ...prevAppointments,
        available: prevAppointments.available.filter(
          (appt) => appt.slotId !== slotId
        ),
      }));
    } catch (error) {
      console.error('Error deleting slot:', error);
    }
  };

  const headers = [
    { key: 'date', header: 'Date' },
    { key: 'sessionTime', header: 'Session Time' },
    { key: 'location', header: 'Location' },
    { key: 'status', header: 'Status' },
    { key: 'action', header: 'Action' },
  ];

  const paginatedAvailableAppointments = appointments.available.slice(
    (availablePage - 1) * availableItemsPerPage,
    availablePage * availableItemsPerPage
  );

  const paginatedPendingAppointments = appointments.pendingOrBooked.slice(
    (pendingPage - 1) * pendingItemsPerPage,
    pendingPage * pendingItemsPerPage
  );

  const paginatedFinishedAppointments = appointments.finished.slice(
    (finishedPage - 1) * finishedItemsPerPage,
    finishedPage * finishedItemsPerPage
  );

  return (
    <Grid className="scheduling-grid">
      <Column lg={16} md={8} sm={4} className="scheduling-page__banner">
        <Breadcrumb noTrailingSlash aria-label="Page navigation">
          <BreadcrumbItem>
            <a href="/">Home</a>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>Appointment</BreadcrumbItem>
        </Breadcrumb>
        <h1>Manage Your Appointment (Physician)</h1>
      </Column>

      <Column lg={16} md={8} sm={4} className="info-page__r2">
        <Tabs onChange={(index) => handleTabChange(index.selectedIndex)}>
          <TabList aria-label="Appointment Status Tabs">
            <Tab>Open Slots</Tab>
            <Tab>Scheduled Appointments</Tab>
            <Tab>Completed Appointments</Tab>
          </TabList>
          <TabPanels>
            {/* Available Tab */}
            <TabPanel>
              <Grid>
                <Column lg={10} md={5} sm={4}>
                  <DataTable
                    rows={paginatedAvailableAppointments}
                    headers={headers}
                    isSortable
                  >
                    {({
                      rows,
                      headers,
                      getHeaderProps,
                      getRowProps,
                      getTableProps,
                      getTableContainerProps,
                      getToolbarProps,
                      onInputChange,
                    }) => (
                      <TableContainer
                        title="Available Open Slots"
                        description="View all upcoming open slots available for scheduling. Use the 'Delete' button to cancel any slots that are no longer required."
                        className="my-schedule__table"
                        {...getTableContainerProps()}
                      >
                        <TableToolbar {...getToolbarProps()}>
                          <TableToolbarContent>
                            <TableToolbarSearch onChange={onInputChange} />
                          </TableToolbarContent>
                        </TableToolbar>
                        <Table {...getTableProps()}>
                          <TableHead>
                            <TableRow>
                              {headers.map((header) => (
                                <TableHeader
                                  key={header.key}
                                  {...getHeaderProps({ header })}
                                >
                                  {header.header}
                                </TableHeader>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {rows.map((row) => {
                              const originalSlot = slotMap[row.id];

                              return (
                                <TableRow
                                  key={row.id}
                                  {...getRowProps({ row })}
                                >
                                  {row.cells.map((cell) => {
                                    return (
                                      <TableCell key={cell.id}>
                                        {cell.info.header === 'status' ? (
                                          <span
                                            className={`status-cell ${
                                              cell.value === 'Available'
                                                ? 'available-status'
                                                : ''
                                            }`}
                                          >
                                            {cell.value}
                                          </span>
                                        ) : cell.info?.header === 'action' ? (
                                          <Button
                                            kind="ghost"
                                            renderIcon={TrashCan}
                                            iconDescription="Delete This Slot"
                                            hasIconOnly
                                            onClick={() => {
                                              console.log(
                                                'Deleting slot with scheduleId:',
                                                originalSlot.scheduleId,
                                                'and slotId:',
                                                originalSlot.slotId
                                              );
                                              handleDeleteSlotClick(
                                                originalSlot.scheduleId,
                                                originalSlot.slotId
                                              );
                                            }}
                                          />
                                        ) : (
                                          cell.value
                                        )}
                                      </TableCell>
                                    );
                                  })}
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                        <Pagination
                          page={availablePage}
                          pageSize={availableItemsPerPage}
                          pageSizes={[5, 10, 15]}
                          totalItems={appointments.available.length}
                          onChange={({ page, pageSize }) => {
                            setAvailablePage(page);
                            setAvailableItemsPerPage(pageSize);
                          }}
                        />
                      </TableContainer>
                    )}
                  </DataTable>
                </Column>
                <Column lg={6} md={7} sm={2} className="info-page__content_r ">
                  <img
                    className="info-page__illo"
                    src="/images/physician-appointment_1.png"
                    alt="online calendar illustration"
                  ></img>
                </Column>
              </Grid>
            </TabPanel>
            {/* Pending/Booked Tab */}
            <TabPanel>
              <Grid>
                <Column lg={10} md={5} sm={4}>
                  <DataTable
                    rows={paginatedPendingAppointments}
                    headers={[
                      { key: 'date', header: 'Date' },
                      { key: 'patientName', header: 'Patient Name' },
                      { key: 'sessionTime', header: 'Session Time' },
                      { key: 'location', header: 'Location' },
                      { key: 'status', header: 'Status' },
                      { key: 'action', header: 'Action' },
                    ]}
                    isSortable
                  >
                    {({
                      rows,
                      headers,
                      getHeaderProps,
                      getRowProps,
                      getTableProps,
                      getTableContainerProps,
                      getToolbarProps,
                      onInputChange,
                    }) => (
                      <TableContainer
                        title="Pending and Booked Appointments"
                        description="View and manage pending/booked appointments. Pending appointments can be confirmed by selecting 'Confirm Appointment.' For booked appointments, select 'Cehck Details' to review the patient’s detail information and add diagnostic notes if necessary."
                        className="my-schedule__table"
                        {...getTableContainerProps()}
                      >
                        <TableToolbar {...getToolbarProps()}>
                          <TableToolbarContent>
                            <TableToolbarSearch onChange={onInputChange} />
                          </TableToolbarContent>
                        </TableToolbar>
                        <Table {...getTableProps()}>
                          <TableHead>
                            <TableRow>
                              {headers.map((header) => (
                                <TableHeader
                                  key={header.key}
                                  {...getHeaderProps({ header })}
                                >
                                  {header.header}
                                </TableHeader>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {rows.map((row) => {
                              const originalSlot = slotMap[row.id];
                              return (
                                <TableRow
                                  key={row.id}
                                  {...getRowProps({ row })}
                                >
                                  {row.cells.map((cell) => {
                                    if (cell.info.header === 'patientName') {
                                      return (
                                        <TableCell key={cell.id}>
                                          {originalSlot?.patientInfo?.name ||
                                            'N/A'}
                                        </TableCell>
                                      );
                                    }
                                    if (cell.info.header === 'action') {
                                      return (
                                        <TableCell key={cell.id}>
                                          <Button
                                            kind="ghost"
                                            renderIcon={
                                              originalSlot?.status === 'Booked'
                                                ? Edit
                                                : Checkmark
                                            }
                                            iconDescription={
                                              originalSlot?.status === 'Booked'
                                                ? 'Check Detail'
                                                : 'Confirm Appointment'
                                            }
                                            hasIconOnly
                                            onClick={() => {
                                              if (
                                                originalSlot?.status ===
                                                'Booked'
                                              ) {
                                                openPatientInfoModal(
                                                  originalSlot?.patientInfo,
                                                  originalSlot?.bookedPatientId,
                                                  originalSlot?.scheduleId,
                                                  originalSlot?.slotId
                                                );
                                              } else {
                                                handleBookingConfirmClick(
                                                  originalSlot.scheduleId,
                                                  originalSlot.slotId
                                                );
                                              }
                                            }}
                                          />
                                        </TableCell>
                                      );
                                    }
                                    if (cell.info.header === 'status') {
                                      return (
                                        <TableCell key={cell.id}>
                                          <span
                                            className={`status-cell ${
                                              cell.value === 'Pending'
                                                ? 'pending-status'
                                                : cell.value === 'Booked'
                                                  ? 'booked-status'
                                                  : ''
                                            }`}
                                          >
                                            {cell.value}
                                          </span>
                                        </TableCell>
                                      );
                                    }
                                    return (
                                      <TableCell key={cell.id}>
                                        {cell.value}
                                      </TableCell>
                                    );
                                  })}
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                        <Pagination
                          page={pendingPage}
                          pageSize={pendingItemsPerPage}
                          pageSizes={[5, 10, 15]}
                          totalItems={appointments.pendingOrBooked.length}
                          onChange={({ page, pageSize }) => {
                            setPendingPage(page);
                            setPendingItemsPerPage(pageSize);
                          }}
                        />
                      </TableContainer>
                    )}
                  </DataTable>
                </Column>
                <Column lg={6} md={7} sm={2} className="info-page__content_r ">
                  <img
                    className="info-page__illo"
                    src="/images/physician-appointment_2.png"
                    alt="online calendar illustration"
                  ></img>
                </Column>
              </Grid>
            </TabPanel>
            {/* Finished Tab */}
            <TabPanel>
              <Grid>
                <Column lg={10} md={5} sm={4}>
                  <DataTable
                    rows={paginatedFinishedAppointments}
                    headers={[
                      { key: 'date', header: 'Date' },
                      { key: 'patientName', header: 'Patient Name' },
                      { key: 'sessionTime', header: 'Session Time' },
                      { key: 'location', header: 'Location' },
                      { key: 'status', header: 'Status' },
                      { key: 'action', header: 'Action' },
                    ]}
                    isSortable
                  >
                    {({
                      rows,
                      headers,
                      getHeaderProps,
                      getRowProps,
                      getTableProps,
                      getTableContainerProps,
                      getToolbarProps,
                      onInputChange,
                    }) => (
                      <TableContainer
                        title="Completed Appointments"
                        description="Review records of completed appointments."
                        className="my-schedule__table"
                        {...getTableContainerProps()}
                      >
                        <TableToolbar {...getToolbarProps()}>
                          <TableToolbarContent>
                            <TableToolbarSearch onChange={onInputChange} />
                          </TableToolbarContent>
                        </TableToolbar>
                        <Table {...getTableProps()}>
                          <TableHead>
                            <TableRow>
                              {headers.map((header) => (
                                <TableHeader
                                  key={header.key}
                                  {...getHeaderProps({ header })}
                                >
                                  {header.header}
                                </TableHeader>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {rows.map((row) => {
                              const originalSlot = slotMap[row.id];
                              return (
                                <TableRow
                                  key={row.id}
                                  {...getRowProps({ row })}
                                >
                                  {row.cells.map((cell) => {
                                    if (cell.info.header === 'patientName') {
                                      return (
                                        <TableCell key={cell.id}>
                                          {originalSlot?.patientInfo?.name ||
                                            'N/A'}
                                        </TableCell>
                                      );
                                    }
                                    if (cell.info.header === 'status') {
                                      return (
                                        <TableCell key={cell.id}>
                                          <span className="finished-status">
                                            {cell.value}
                                          </span>
                                        </TableCell>
                                      );
                                    }
                                    if (cell.info.header === 'action') {
                                      return (
                                        <TableCell key={cell.id}>
                                          <Button
                                            kind="ghost"
                                            renderIcon={Document}
                                            iconDescription="View History"
                                            hasIconOnly
                                            onClick={() => {
                                              openPatientInfoModal(
                                                originalSlot?.patientInfo,
                                                originalSlot?.bookedPatientId
                                              );
                                            }}
                                          />
                                        </TableCell>
                                      );
                                    }
                                    return (
                                      <TableCell key={cell.id}>
                                        {cell.value}
                                      </TableCell>
                                    );
                                  })}
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                        <Pagination
                          page={finishedPage}
                          pageSize={finishedItemsPerPage}
                          pageSizes={[5, 10, 15]}
                          totalItems={appointments.finished.length}
                          onChange={({ page, pageSize }) => {
                            setFinishedPage(page);
                            setFinishedItemsPerPage(pageSize);
                          }}
                        />
                      </TableContainer>
                    )}
                  </DataTable>
                </Column>
                <Column lg={6} md={7} sm={2} className="info-page__content_r">
                  <img
                    className="info-page__illo"
                    src="/images/physician-appointment_3.png"
                    alt="online calendar illustration"
                  ></img>
                </Column>
              </Grid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Column>

      <Modal
        open={showDeleteSlotConfirmModal}
        modalHeading="Are you sure you want to cancel this scheduled slot?"
        primaryButtonText="Confirm"
        secondaryButtonText="Close"
        onRequestClose={() => setShowDeleteSlotConfirmModal(false)}
        onRequestSubmit={confirmDeleteSlot}
      >
        <p>
          Please cancel scheduled slots only for unavoidable reasons. Once
          canceled, this action cannot be undone.
        </p>
      </Modal>

      <Modal
        open={showDeleteSlotSuccessModal}
        modalHeading="Cancellation Successful"
        onRequestClose={() => setShowDeleteSlotSuccessModal(false)}
        passiveModal
      >
        <p>Your scheduled slot has been successfully canceled.</p>
      </Modal>

      <Modal
        open={showBookingConfirmModal}
        modalHeading="Are you sure you want to confirm this booking?"
        primaryButtonText="Confirm"
        secondaryButtonText="Close"
        onRequestClose={() => setShowBookingConfirmModal(false)}
        onRequestSubmit={confirmBooking}
      >
        <p>Once confirmed, this action cannot be undone.</p>
      </Modal>

      <Modal
        open={showBookingSuccessModal}
        modalHeading="Booking Confirmed"
        onRequestClose={() => setShowBookingSuccessModal(false)}
        passiveModal
      >
        <p>Your booking has been successfully confirmed.</p>
      </Modal>

      <Modal
        className="patient-info-modal"
        open={showPatientInfoModal}
        modalHeading="Patient Information"
        primaryButtonText="Complete Appointment"
        secondaryButtonText="Cancel"
        onRequestClose={() => setShowPatientInfoModal(false)}
        onRequestSubmit={handleCompleteAppointment}
        passiveModal={activeTab === 'Completed'}
      >
        {selectedPatientData && (
          <>
            <p className="description">
              {activeTab === 'Completed'
                ? 'Review past patient information and medical records.'
                : 'Review and update each medical background detail by clicking the "Add Diagnosis" button. Once both you and the patient agree or you determine that the session can be concluded, please press "Complete Appointment" to finalize this session.'}
            </p>
            <DataTable
              rows={selectedPatientData.generalInfo}
              headers={userInfoHeaders}
            >
              {({
                rows,
                headers,
                getHeaderProps,
                getRowProps,
                getTableProps,
              }) => (
                <TableContainer
                  className="patient-info-modal__table"
                  title="General Information"
                >
                  <Table {...getTableProps()}>
                    <TableHead>
                      <TableRow>
                        {headers.map((header) => (
                          <TableHeader
                            key={header.key}
                            {...getHeaderProps({ header })}
                          >
                            {header.header}
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow key={row.id} {...getRowProps({ row })}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DataTable>

            <DataTable
              rows={selectedPatientData.allergies}
              headers={allergyDetailsHeaders}
            >
              {({
                rows,
                headers,
                getHeaderProps,
                getRowProps,
                getTableProps,
              }) => (
                <TableContainer
                  className="patient-info-modal__table"
                  title="Allergies"
                >
                  <Table {...getTableProps()}>
                    <TableHead>
                      <TableRow>
                        {headers.map((header) => (
                          <TableHeader
                            key={header.key}
                            {...getHeaderProps({ header })}
                          >
                            {header.header}
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row, rowIndex) => (
                        <TableRow key={row.id} {...getRowProps({ row })}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>
                              {cell.info.header === 'edit' ? (
                                <Button
                                  kind="ghost"
                                  size="small"
                                  renderIcon={ChartCustom}
                                  iconDescription="Add Diagnosis"
                                  hasIconOnly
                                  onClick={() => {
                                    console.log(
                                      'Button clicked for row:',
                                      rowIndex
                                    );
                                    console.log(
                                      'Passing note data:',
                                      selectedPatientData.allergies[rowIndex]
                                        .note
                                    );
                                    openNoteModal(
                                      'allergies',
                                      rowIndex,
                                      selectedPatientData.allergies[rowIndex]
                                        .note
                                    );
                                  }}
                                ></Button>
                              ) : (
                                cell.value
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DataTable>

            <DataTable
              rows={selectedPatientData.vaccinations}
              headers={vaccinationDetailsHeaders}
            >
              {({
                rows,
                headers,
                getHeaderProps,
                getRowProps,
                getTableProps,
              }) => (
                <TableContainer
                  className="patient-info-modal__table"
                  title="Vaccinations"
                >
                  <Table {...getTableProps()}>
                    <TableHead>
                      <TableRow>
                        {headers.map((header) => (
                          <TableHeader
                            key={header.key}
                            {...getHeaderProps({ header })}
                          >
                            {header.header}
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row, rowIndex) => (
                        <TableRow key={row.id} {...getRowProps({ row })}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>
                              {cell.info.header === 'edit' ? (
                                <Button
                                  kind="ghost"
                                  size="small"
                                  renderIcon={ChartCustom}
                                  iconDescription="Add Diagnosis"
                                  hasIconOnly
                                  onClick={() =>
                                    openNoteModal(
                                      'vaccinations',
                                      rowIndex,
                                      selectedPatientData.vaccinations[rowIndex]
                                        .note
                                    )
                                  }
                                ></Button>
                              ) : (
                                cell.value
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DataTable>
          </>
        )}
      </Modal>
      <Modal
        className="modal__text-area"
        open={showNoteModal}
        modalHeading={
          activeTab === 'Completed'
            ? 'Review Your Diagnosis'
            : 'Provide Your Diagnosis'
        }
        primaryButtonText="Save"
        secondaryButtonText="Cancel"
        onRequestClose={() => {
          setShowNoteModal(false);
          setShowPatientInfoModal(true);
        }}
        onRequestSubmit={() => {
          handleSaveNote();
          setShowNoteModal(false);
        }}
        passiveModal={activeTab === 'Completed'}
      >
        <TextArea
          labelText={
            activeTab === 'Completed'
              ? 'Dagnosis Note (Read Only)'
              : 'Dagnosis Note'
          }
          value={noteContent}
          onChange={handleNoteChange}
          placeholder={
            activeTab === 'Completed'
              ? 'Diagnosis note preview'
              : 'Update note here'
          }
          helperText={
            activeTab === 'Completed'
              ? "Review the diagnosis based on the patient's medical data."
              : "Please provide a diagnosis based on the patient's medical data and current status"
          }
          readOnly={activeTab === 'Completed'}
        />
      </Modal>
      <Modal
        open={showNoteSuccessModal}
        modalHeading="Note Update Successful"
        onRequestClose={() => {
          setShowNoteSuccessModal(false), setShowPatientInfoModal(true);
        }}
        passiveModal
      >
        <p>Your diagnosis has been successfully updated.</p>
      </Modal>
      <Modal
        open={showCompleteConfirmModal}
        modalHeading="Confirm Appointment Completion"
        primaryButtonText="Yes, Complete"
        secondaryButtonText="Cancel"
        onRequestClose={() => setShowCompleteConfirmModal(false)}
        onRequestSubmit={handleConfirmCompletion}
      >
        <p>
          Are you sure you want to complete this appointment session? Once
          confirmed, the status will be marked as Finished, and no further
          changes can be made.
        </p>
      </Modal>
      <Modal
        open={showCompleteSuccessModal}
        modalHeading="Appointment Completed"
        onRequestClose={() => setShowCompleteSuccessModal(false)}
        passiveModal
      >
        <p>The appointment has been successfully marked as Finished.</p>
      </Modal>
    </Grid>
  );
};

export default PhysicianAppointmentPage;
