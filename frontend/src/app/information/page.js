'use client';

import moment from 'moment';

import React, { useEffect, useState } from 'react';
import {
  Button,
  Breadcrumb,
  BreadcrumbItem,
  Grid,
  Column,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@carbon/react';
import { IbmEloPublishing } from '@carbon/icons-react';

import { useAuth } from '@/context/AuthContext';
import userService from '@/services/userService';
import TableSection from '@/components/Table/Table';
import EditModal from '@/components/EditModal/EditModal';

const InformationPage = () => {
  const { role, userId, setFirstName } = useAuth();
  const [userData, setUserData] = useState(null);
  const [allergies, setAllergies] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [passiveModal, setPassiveModal] = useState(false);
  const [modalHeading, setModalHeading] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [formFields, setFormFields] = useState([]);
  const [initialData, setInitialData] = useState({});
  const [currentSelectedIndex, setCurrentSelectedIndex] = useState(0);

  const openModal = (tabName, initialData = {}) => {
    setInitialData(initialData);

    if (tabName === 'MyInfo') {
      setModalHeading('Update My Information');
      setModalDescription(
        'Update your personal details to ensure your information is accurate and up-to-date for better service experience'
      );
      setFormFields([
        {
          name: 'firstName',
          label: 'First Name',
          type: 'text',
          placeholder:
            userData.firstName || 'Enter your first name (e.g., John)',
        },
        {
          name: 'lastName',
          label: 'Last Name',
          type: 'text',
          placeholder: userData.lastName || 'Enter your last name (e.g., Doe)',
        },
        {
          name: 'phoneNumber',
          label: 'Phone Number (Optional)',
          type: 'text',
          placeholder:
            userData.phoneNumber ||
            'Enter your phone number (e.g., 0411-222-333)',
        },
        {
          name: 'gender',
          label: 'Gender',
          type: 'radio',
          options: ['Male', 'Female', 'Other'],
          valueSelected: userData.gender,
        },
        {
          name: 'dateOfBirth',
          label: 'Date of Birth',
          type: 'date',
          placeholder:
            moment(userData.dateOfBirth).format('MM/DD/YYYY') || 'mm/dd/yyyy',
        },
      ]);
    } else if (tabName === 'Allergy') {
      setModalHeading('Add Allergy / Intolerance Data');
      setModalDescription(
        'Please provide the necessary details about your allergy or intolerance information for accurate medical records'
      );
      setFormFields([
        {
          name: 'type',
          label: 'Type',
          type: 'radio',
          options: ['Allergy', 'Intolerance'],
        },
        {
          name: 'category',
          label: 'Category',
          type: 'dropdown',
          options: ['Food', 'Medication', 'Environment', 'Biologic', 'Other'],
          placeholder: 'Select the category',
        },
        {
          name: 'criticality',
          label: 'Criticality',
          type: 'dropdown',
          options: ['Low', 'Mid', 'High', 'Unable to Assess'],
          placeholder: 'Select the criticality level',
        },
        {
          name: 'name',
          label: 'Allergy Name',
          type: 'text',
          placeholder: 'Enter the name of the allergen (e.g., Peanuts)',
        },
        {
          name: 'recordedDate',
          label: 'Recorded Date',
          type: 'date',
          placeholder: 'mm/dd/yyyy',
        },
        {
          name: 'onsetDateTime',
          label: 'Onset Date',
          type: 'date',
          placeholder: 'mm/dd/yyyy',
        },
        {
          name: 'note',
          label: 'Note (Read-only)',
          type: 'textarea',
          placeholder:
            'This section will be updated by the physician during/after an appointment.',
        },
      ]);
    } else if (tabName === 'Vaccination') {
      setModalHeading('Add Vaccination History');
      setModalDescription(
        'Please enter your vaccination status to ensure accurate health tracking and your latest immunization'
      );
      setFormFields([
        {
          name: 'vaccineCode',
          label: 'Vaccine Name',
          type: 'text',
          placeholder: 'Enter the name of the vaccine (e.g., COVID-19)',
        },
        {
          name: 'status',
          label: 'Status',
          type: 'dropdown',
          options: ['Completed', 'In Progress', 'Not Done', 'Other'],
          placeholder: 'Select the current status of the vaccination',
        },
        {
          name: 'date',
          label: 'Date',
          type: 'date',
          placeholder: 'mm/dd/yyyy',
        },
        {
          name: 'doseNumber',
          label: 'Dose Number',
          type: 'dropdown',
          options: [
            '1st Dose',
            '2nd Dose',
            '3rd Dose',
            'Booster Dose',
            'Final Dose',
            'Other',
          ],
          placeholder: 'Select the current dose number',
        },
        {
          name: 'provider',
          label: 'Provider',
          type: 'text',
          placeholder:
            'Enter the name of the healthcare provider (e.g., Pfizer)',
        },
        {
          name: 'note',
          label: 'Note (Read-only)',
          type: 'textarea',
          placeholder:
            'Read-only. This section will be updated by the physician during/after an appointment.',
        },
      ]);
    } else if (tabName === 'Qualification') {
      setModalHeading('Add Qualification Details');
      setModalDescription(
        'Please provide your qualification details to maintain accurate professional records and ensure compliance with industry standards'
      );
      setFormFields([
        {
          name: 'type',
          label: 'Qualification Type',
          type: 'dropdown',
          options: [
            'Qualifications',
            'Certifications',
            'Accreditations',
            'Licenses',
            'Training',
            'Others',
          ],
          placeholder: 'Select your qualification type',
        },
        {
          name: 'name',
          label: 'Qualification Name',
          type: 'text',
          placeholder:
            'Enter the name of your qualification (e.g., General Practitioner (GP), Specialist Physician)',
        },
        {
          name: 'startDate',
          label: 'Start Date',
          type: 'date',
          placeholder: 'mm/dd/yyyy',
        },
        {
          name: 'endDate',
          label: 'End Date',
          type: 'date',
          placeholder: 'mm/dd/yyyy',
        },
        {
          name: 'issuer',
          label: 'Issuer',
          type: 'text',
          placeholder:
            'Enter the name of the issuing organization (e.g., Australian Medical Council)',
        },
      ]);
    } else if (tabName === 'Allergy-Details') {
      setModalHeading('Allergy / Intolerance Details');

      const allergyDetailsHeaders = [
        { key: 'label', header: 'Label' },
        { key: 'value', header: 'Information' },
      ];

      const allergyDetailsRows = [
        { label: 'Type', value: initialData.type },
        { label: 'Category', value: initialData.category },
        { label: 'Criticality', value: initialData.criticality },
        { label: 'Allergy Name', value: initialData.name },
        {
          label: 'Recorded Date',
          value: moment(initialData.recordedDate).format('MM/DD/YYYY'),
        },
        {
          label: 'Onset Date',
          value: moment(initialData.onsetDateTime).format('MM/DD/YYYY'),
        },
        { label: 'Note', value: initialData.note || 'No additional notes' },
      ];

      setFormFields({
        headers: allergyDetailsHeaders,
        rows: allergyDetailsRows,
      });
    } else if (tabName === 'Vaccination-Details') {
      setModalHeading('Vaccination History Details');

      const vaccinationDetailsHeaders = [
        { key: 'label', header: 'Label' },
        { key: 'value', header: 'Information' },
      ];

      const vaccinationDetailsRows = [
        { label: 'Code', value: initialData.vaccineCode },
        { label: 'Status', value: initialData.status },
        {
          label: 'Date',
          value: moment(initialData.date).format('MM/DD/YYYY'),
        },
        { label: 'Dose Number', value: initialData.doseNumber },
        { label: 'Provider', value: initialData.provider },
        { label: 'Note', value: initialData.note || 'No additional notes' },
      ];

      setFormFields({
        headers: vaccinationDetailsHeaders,
        rows: vaccinationDetailsRows,
      });
    }
    const isPassive =
      tabName === 'Allergy-Details' || tabName === 'Vaccination-Details';

    setIsModalOpen(true);
    setPassiveModal(isPassive);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setInitialData({});
  };

  const handleSave = async (formData) => {
    console.log('Info-Page: Handle Save: Form data being submitted:', formData);
    console.log('handle save: selectedTab index:', currentSelectedIndex);
    console.log('FormData:', formData);

    try {
      await userService.saveUserData(userId, currentSelectedIndex, formData);
      if (currentSelectedIndex === 0) {
        const updatedUserInfo = await userService.getUserInfo(userId);
        setUserData(updatedUserInfo);
        setFirstName(updatedUserInfo.firstName);
      } else if (currentSelectedIndex === 1) {
        const updatedAllergies = await userService.getUserAllergies(userId);
        setAllergies(updatedAllergies);
      } else if (currentSelectedIndex === 2) {
        const updatedVaccinations =
          await userService.getUserVaccinations(userId);
        setVaccinations(updatedVaccinations);
      } else if (currentSelectedIndex === 3) {
        const updatedQualifications =
          await userService.getUserQualifications(userId);
        setQualifications(updatedQualifications);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const handleTabChange = (index) => {
    console.log('Previous selectedTab index:', currentSelectedIndex);
    setCurrentSelectedIndex(index);
    console.log('Updated index:', index);

    if (index === 1 && allergies.length === 0) {
      console.log('No allergy data found, showing empty table');
    } else if (index === 2 && vaccinations.length === 0) {
      console.log('No vaccination data found, showing empty table');
    }
  };

  useEffect(() => {
    const fetchTabData = async () => {
      try {
        console.log(
          'useEffect: Current selectedTab index:',
          currentSelectedIndex
        );

        if (role === 'Patient') {
          if (currentSelectedIndex === 0) {
            const response = await userService.getUserInfo(userId);
            console.log('Fetched user data:', response);
            setUserData(response);
          } else if (currentSelectedIndex === 1) {
            const allergyResponse = await userService.getUserAllergies(userId);
            console.log('Fetched allergy data:', allergyResponse);
            setAllergies(allergyResponse);
          } else if (currentSelectedIndex === 2) {
            const vaccinationResponse =
              await userService.getUserVaccinations(userId);
            console.log('Fetched vaccination data:', vaccinationResponse);
            setVaccinations(vaccinationResponse);
          }
        } else if (role === 'Physician') {
          if (currentSelectedIndex === 0) {
            const response = await userService.getUserInfo(userId);
            console.log('Fetched user data:', response);
            setUserData(response);
          } else if (currentSelectedIndex === 3) {
            const qualificationResponse =
              await userService.getUserQualifications(userId);
            console.log('Fetched qualification data:', qualificationResponse);
            setQualifications(qualificationResponse);
          }
        }
      } catch (error) {
        console.error('Error fetching data for tab:', error);
      }
    };

    if (userId) {
      fetchTabData();
    }
  }, [role, currentSelectedIndex, userId]);

  if (!userData) {
    return <p>Loading user information...</p>; // to be modified using skeletal
  }

  const userInfoRows = [
    { label: 'First Name', value: userData.firstName },
    { label: 'Last Name', value: userData.lastName },
    { label: 'Email', value: userData.email },
    { label: 'Phone', value: userData.phoneNumber },
    { label: 'Gender', value: userData.gender },
    {
      label: 'Birth Date',
      value: moment(userData.dateOfBirth).format('DD-MM-YYYY'),
    },
    { label: 'Role', value: role },
  ];
  const userInfoHeaders = [
    { key: 'label', header: 'Label' },
    { key: 'value', header: 'Information' },
  ];

  const allergyRows = allergies.map((allergy) => ({
    type: allergy.type,
    name: allergy.name,
    category: allergy.category,
    criticality: allergy.criticality,
    action: (
      <Button
        kind="ghost"
        renderIcon={IbmEloPublishing}
        iconDescription="View Details"
        hasIconOnly
        onClick={() => openModal('Allergy-Details', allergy)}
      />
    ),
  }));
  const allergyHeaders = [
    { key: 'type', header: 'Type' },
    { key: 'name', header: 'Name' },
    { key: 'category', header: 'Category' },
    { key: 'criticality', header: 'Criticality' },
    { key: 'details' },
  ];

  const vaccinationRows = vaccinations.map((vaccination) => ({
    vaccineCode: vaccination.vaccineCode,
    status: vaccination.status,
    date: moment(vaccination.date).format('DD-MM-YYYY'),
    provider: vaccination.provider,
    action: (
      <Button
        kind="ghost"
        renderIcon={IbmEloPublishing}
        iconDescription="View Details"
        hasIconOnly
        onClick={() => openModal('Vaccination-Details', vaccination)}
      />
    ),
  }));
  const vaccinationHeaders = [
    { key: 'vaccineCode', header: 'Code' },
    { key: 'status', header: 'Status' },
    { key: 'date', header: 'Date' },
    { key: 'provider', header: 'Provider' },
    { key: 'details' },
  ];

  const qualificationRows = qualifications.map((qualification) => ({
    type: qualification.type,
    name: qualification.name,
    period: `${moment(qualification.startDate).format('DD-MM-YYYY')} ~ ${moment(qualification.endDate).format('DD-MM-YYYY')}`,
    issuer: qualification.issuer,
  }));
  const qualificationHeaders = [
    { key: 'type', header: 'Type' },
    { key: 'name', header: 'Name' },
    { key: 'period', header: 'Period' },
    { key: 'issuer', header: 'issuer' },
  ];
  return (
    <Grid className="info-grid">
      <Column lg={16} md={8} sm={4} className="info-page__banner">
        <Breadcrumb noTrailingSlash aria-label="Page navigation">
          <BreadcrumbItem>
            <a href="/">Home</a>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>Information</BreadcrumbItem>
        </Breadcrumb>
        <h1>My Healthcare Information</h1>
      </Column>

      <Column lg={16} md={8} sm={4} className="info-page__r2">
        <Tabs onChange={(index) => handleTabChange(index.selectedIndex)}>
          <TabList aria-label="List of tabs">
            <Tab>MyInfo</Tab>
            {role === 'Patient' && (
              <>
                <Tab>Allergy</Tab>
              </>
            )}
            {role === 'Patient' && (
              <>
                <Tab>Vaccination</Tab>
              </>
            )}
            {role === 'Physician' && (
              <>
                <Tab>Qualification</Tab>
              </>
            )}
          </TabList>

          <TabPanels>
            <TabPanel>
              <Grid>
                <Column lg={8} md={4} sm={4}>
                  <TableSection
                    title="User Information"
                    headers={userInfoHeaders}
                    rows={userInfoRows}
                    onEdit={() => openModal('MyInfo')}
                    index={currentSelectedIndex}
                    showButton={true}
                  />
                </Column>
                <Column className="info-page__content_r" lg={8} md={5} sm={4}>
                  <img
                    className="info-page__illo"
                    src={
                      role === 'Patient'
                        ? '/images/patient-information.png'
                        : '/images/physician-information.png'
                    }
                    alt={
                      role === 'Patient'
                        ? 'patient journey illustration'
                        : 'medical research illustration'
                    }
                  />
                </Column>
              </Grid>
            </TabPanel>

            <TabPanel>
              <Grid>
                <Column lg={8} md={4} sm={4}>
                  <TableSection
                    title="Allergy / Intolerance Data"
                    headers={allergyHeaders}
                    rows={allergyRows}
                    onEdit={() => openModal('Allergy')}
                    showButton={true}
                  />
                </Column>
                <Column className="info-page__content_r" lg={8} md={5} sm={4}>
                  <img
                    className="info-page__illo"
                    src="/images/tab1_allergy.png"
                    alt="carousel horse illustration"
                  />
                </Column>
              </Grid>
            </TabPanel>

            <TabPanel>
              <Grid>
                <Column lg={8} md={4} sm={4}>
                  <TableSection
                    title="Vaccination History"
                    headers={vaccinationHeaders}
                    rows={vaccinationRows}
                    onEdit={() => openModal('Vaccination')}
                    showButton={true}
                  />
                </Column>
                <Column className="info-page__content_r" lg={8} md={5} sm={4}>
                  <img
                    className="info-page__illo"
                    src="/images/tab2_vaccination.png"
                    alt="vaccination phase illustration"
                  />
                </Column>
              </Grid>
            </TabPanel>

            <TabPanel>
              <Grid>
                <Column lg={8} md={4} sm={4}>
                  <TableSection
                    title="Medical Qualification"
                    headers={qualificationHeaders}
                    rows={qualificationRows}
                    onEdit={() => openModal('Qualification')}
                    showButton={true}
                  />
                </Column>
                <Column className="info-page__content_r" lg={8} md={5} sm={4}>
                  <img
                    className="info-page__illo"
                    src="/images/tab3_qualification.png"
                    alt="cherry blossom tree illustration"
                  />
                </Column>
              </Grid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Column>
      <EditModal
        isModalOpen={isModalOpen}
        passiveModal={passiveModal}
        closeModal={closeModal}
        modalHeading={modalHeading}
        modalDescription={modalDescription}
        formFields={formFields}
        initialData={initialData}
        onSubmit={handleSave}
        index={currentSelectedIndex}
      />
    </Grid>
  );
};

export default InformationPage;
