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
  Pagination,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Modal,
  TextArea,
} from '@carbon/react';
import { TrashCan, Document, ChartCustom } from '@carbon/icons-react';

const PatientSchedulingPage = () => {
  const { userId } = useAuth();
  const [slotMap, setSlotMap] = useState({});
  const [selectedPatientData, setSelectedPatientData] = useState({
    allergies: [],
    vaccinations: [],
  });
  const [pendingOrBookedSlots, setPendingOrBookedSlots] = useState([]);
  const [finishedSlots, setFinishedSlots] = useState([]);
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingItemsPerPage, setPendingItemsPerPage] = useState(5);
  const [finishedPage, setFinishedPage] = useState(1);
  const [finishedItemsPerPage, setFinishedItemsPerPage] = useState(5);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCancelSuccessModal, setShowCancelSuccessModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [currentNoteIndex, setCurrentNoteIndex] = useState(null);
  const [noteType, setNoteType] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [currentSelectedIndex, setCurrentSelectedIndex] = useState(0);

  const paginatedPendingOrBookedSlots = pendingOrBookedSlots.slice(
    (pendingPage - 1) * pendingItemsPerPage,
    pendingPage * pendingItemsPerPage
  );

  const paginatedFinishedSlots = finishedSlots.slice(
    (finishedPage - 1) * finishedItemsPerPage,
    finishedPage * finishedItemsPerPage
  );

  const handleTabChange = (index) => {
    setCurrentSelectedIndex(index);
  };

  useEffect(() => {
    if (userId) {
      const fetchSchedules = async () => {
        try {
          const response = await userService.getUserSchedules(userId);
          console.log('Fetched pending slots:', response);

          const pendingOrBooked = [];
          const finished = [];
          const newSlotMap = {};

          response.forEach((slot, index) => {
            const formattedSlot = {
              ...slot,
              id: `${slot.scheduleId}-${index}`,
              time: `${slot.startTime} - ${slot.endTime}`,
              date: moment(slot.date).format('YYYY-MM-DD'),
              scheduleId: slot.scheduleId,
              slotId: slot.slotId,
              status: slot.status,
            };

            newSlotMap[formattedSlot.id] = slot;

            if (slot.status === 'Pending' || slot.status === 'Booked') {
              pendingOrBooked.push(formattedSlot);
            } else if (slot.status === 'Finished') {
              finished.push(formattedSlot);
            }
          });

          setPendingOrBookedSlots(pendingOrBooked);
          setFinishedSlots(finished);
          setSlotMap(newSlotMap);
          console.log('pendingorbooked', pendingOrBooked);
          console.log('finished', finished);
          console.log('newSlotMap,', newSlotMap);
        } catch (error) {
          console.error('Error fetching schedules:', error);
        }
      };
      fetchSchedules();
    }
  }, [userId, selectedSlot?.status, currentSelectedIndex]);

  const headers = [
    { key: 'date', header: 'Date' },
    { key: 'time', header: 'Session Time' },
    { key: 'physicianName', header: 'Physician' },
    { key: 'location', header: 'Location' },
    { key: 'status', header: 'Status' },
    { key: 'actions', header: 'Actions' },
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

  const renderStatusIcon = (scheduleId, slotId, status) => {
    console.log('render scheduleId:', scheduleId);
    console.log('render slotId:', slotId);
    console.log('render status:', status);

    switch (status) {
      case 'Pending':
        return (
          <Button
            kind="ghost"
            renderIcon={TrashCan}
            iconDescription="Cancel"
            hasIconOnly
            onClick={() => handlePendingAction(scheduleId, slotId, status)}
          />
        );
      case 'Booked':
        return (
          <Button
            kind="ghost"
            renderIcon={Document}
            iconDescription="Diagnosis"
            hasIconOnly
            onClick={() =>
              handleBookedorFinishedAction(scheduleId, slotId, userId)
            }
          />
        );
      case 'Finished':
        return (
          <Button
            kind="ghost"
            renderIcon={Document}
            iconDescription="Diagnosis"
            hasIconOnly
            onClick={() =>
              handleBookedorFinishedAction(scheduleId, slotId, userId)
            }
          />
        );
      default:
        return null;
    }
  };

  const handlePendingAction = (scheduleId, slotId, status) => {
    console.log('handle Schedule ID:', scheduleId);
    console.log('handle Slot ID:', slotId);
    setSelectedSlot({ scheduleId, slotId, status });
    setShowCancelModal(true);
  };

  const handleBookedorFinishedAction = async (scheduleId, slotId, userId) => {
    try {
      setSelectedSlot({ scheduleId, slotId });

      const allergies = await userService.getUserAllergies(userId);
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

      const vaccinations = await userService.getUserVaccinations(userId);
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

      setSelectedPatientData({
        allergies: formattedAllergies,
        vaccinations: formattedVaccinations,
      });
      setShowInfoModal(true);
    } catch (error) {
      console.error('Error fetching patient info:', error);
    }
  };

  const confirmCancel = async () => {
    if (selectedSlot) {
      try {
        console.log(
          'Sending request with:',
          selectedSlot.scheduleId,
          selectedSlot.slotId
        );
        await userService.updateSlotStatus(
          selectedSlot.scheduleId,
          selectedSlot.slotId,
          'Available',
          userId
        );
        setPendingOrBookedSlots((prevSlots) =>
          prevSlots.filter((slot) => slot.id !== selectedSlot.id)
        );
        setShowCancelModal(false);
        setSelectedSlot(null);
        setShowCancelSuccessModal(true);
      } catch (error) {
        console.error('Error canceling slot:', error);
      }
    }
  };

  const openNoteModal = (type, index, existingNote) => {
    console.log('Opening Note Modal with note:', existingNote);
    setShowInfoModal(false);
    setNoteContent(existingNote || '');
    setCurrentNoteIndex(index);
    setNoteType(type);
    setShowNoteModal(true);
  };

  return (
    <Grid className="scheduling-grid">
      <Column lg={16} md={8} sm={4} className="scheduling-page__banner">
        <Breadcrumb noTrailingSlash aria-label="Page navigation">
          <BreadcrumbItem>
            <a href="/">Home</a>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>Schedule</BreadcrumbItem>
        </Breadcrumb>
        <h1>Manage Your Schedules (Patient)</h1>
      </Column>

      <Column lg={16} md={8} sm={4} className="info-page__r2">
        <Tabs onChange={(index) => handleTabChange(index)}>
          <TabList aria-label="List of tabs">
            <Tab>Upcoming Schedules</Tab>
            <Tab>Finished Schedules</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Grid>
                <Column lg={10} md={5} sm={1}>
                  <DataTable
                    rows={paginatedPendingOrBookedSlots}
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
                        title="Upcoming Schedules"
                        description="View and manage your upcoming appointments. 'Pending' status can be canceled using the 'Cancel' button. For 'Booked' appointments, use the 'View Details' button to see any diagnosis notes provided by your practitioner."
                        {...getTableContainerProps()}
                        className="my-schedule__table"
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
                              console.log('originalSlot: ', originalSlot);
                              console.log(
                                'original schedule/slot Id: ',
                                originalSlot.scheduleId,
                                ' and ',
                                originalSlot.slotId
                              );
                              return (
                                <TableRow
                                  key={row.id}
                                  {...getRowProps({ row })}
                                >
                                  {row.cells.map((cell) => (
                                    <TableCell key={cell.id}>
                                      {cell.info.header === 'status' ? (
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
                                      ) : cell.info.header === 'actions' &&
                                        originalSlot ? (
                                        renderStatusIcon(
                                          originalSlot.scheduleId,
                                          originalSlot.slotId,
                                          originalSlot.status
                                        )
                                      ) : (
                                        cell.value
                                      )}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </DataTable>
                  <Pagination
                    page={pendingPage}
                    pageSize={pendingItemsPerPage}
                    pageSizes={[5, 10, 15]}
                    totalItems={pendingOrBookedSlots.length}
                    onChange={({ page, pageSize }) => {
                      setPendingPage(page);
                      setPendingItemsPerPage(pageSize);
                    }}
                  />
                </Column>

                <Column lg={6} md={8} sm={4} className="info-page__content_r">
                  <img
                    className="info-page__illo"
                    src="/images/patient-scheduling_1.png"
                    alt="online schedule check illustration"
                  ></img>
                </Column>
              </Grid>
            </TabPanel>

            <TabPanel>
              <Grid>
                <Column lg={10} md={5} sm={1}>
                  <DataTable
                    rows={paginatedFinishedSlots}
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
                        title="Completed Schedules"
                        description="View your past appointments and any diagnosis notes from your physician. Use the 'View' button to review detailed records and insights from completed sessions."
                        {...getTableContainerProps()}
                        className="my-schedule__table"
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
                              console.log('originalSlot: ', originalSlot);
                              console.log(
                                'original schedule/slot Id: ',
                                originalSlot.scheduleId,
                                ' and ',
                                originalSlot.slotId
                              );
                              return (
                                <TableRow
                                  key={row.id}
                                  {...getRowProps({ row })}
                                >
                                  {row.cells.map((cell) => (
                                    <TableCell key={cell.id}>
                                      {cell.info.header === 'status' ? (
                                        <span
                                          className={`status-cell ${
                                            cell.value === 'Finished'
                                              ? 'finished-status'
                                              : ''
                                          }`}
                                        >
                                          {cell.value}
                                        </span>
                                      ) : cell.info.header === 'actions' &&
                                        originalSlot ? (
                                        renderStatusIcon(
                                          originalSlot.scheduleId,
                                          originalSlot.slotId,
                                          originalSlot.status
                                        )
                                      ) : (
                                        cell.value
                                      )}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </DataTable>
                  <Pagination
                    page={finishedPage}
                    pageSize={finishedItemsPerPage}
                    pageSizes={[5, 10, 15]}
                    totalItems={finishedSlots.length}
                    onChange={({ page, pageSize }) => {
                      setFinishedPage(page);
                      setFinishedItemsPerPage(pageSize);
                    }}
                  />
                </Column>

                <Column lg={6} md={8} sm={4} className="info-page__content_r">
                  <img
                    className="info-page__illo"
                    src="/images/patient-scheduling_2.png"
                    alt="cherry blossom illustration"
                  ></img>
                </Column>
              </Grid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Column>

      <Modal
        open={showCancelModal}
        modalHeading="Are you sure you want to cancel this appointment?"
        primaryButtonText="Confirm"
        secondaryButtonText="Close"
        onRequestClose={() => setShowCancelModal(false)}
        onRequestSubmit={confirmCancel}
      >
        <p>
          Please cancel appointments only for unavoidable reasons. Once
          canceled, this action cannot be undone.
        </p>
      </Modal>

      <Modal
        open={showCancelSuccessModal}
        modalHeading="Cancellation Successful"
        onRequestClose={() => setShowCancelSuccessModal(false)}
        passiveModal
      >
        <p>Your appointment has been successfully canceled.</p>
      </Modal>

      <Modal
        className="patient-info-modal"
        open={showInfoModal}
        modalHeading="My Medical History"
        primaryButtonText="Close"
        onRequestClose={() => setShowInfoModal(false)}
        passiveModal
      >
        <p className="description">
          View your medical history details, including diagnosis notes provided
          by your physician, for a comprehensive overview of your health
          records.
        </p>
        <DataTable
          rows={selectedPatientData.allergies}
          headers={allergyDetailsHeaders}
        >
          {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
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
                              iconDescription="Review Diagnosis"
                              hasIconOnly
                              onClick={() =>
                                openNoteModal(
                                  'allergies',
                                  rowIndex,
                                  selectedPatientData.allergies[rowIndex].note
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

        <DataTable
          rows={selectedPatientData.vaccinations}
          headers={vaccinationDetailsHeaders}
        >
          {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
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
                              iconDescription="Review Diagnosis"
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
      </Modal>
      <Modal
        className="modal__text-area"
        open={showNoteModal}
        modalHeading="Review Diagnosis"
        primaryButtonText="Close"
        onRequestClose={() => {
          setShowNoteModal(false), setShowInfoModal(true);
        }}
        passiveModal={true}
      >
        <TextArea
          labelText="Diagnosis Note (Read Only)"
          value={noteContent}
          placeholder="Diagnosis note preview"
          helperText="This review provided by your physician summarizes key insights and recommendations based on your medical history."
          readOnly={true}
        />
      </Modal>
    </Grid>
  );
};

export default PatientSchedulingPage;
