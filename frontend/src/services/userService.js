import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
  withCredentials: true,
});

const getUserInfo = async (userId) => {
  console.log('GET request to:', `${api.defaults.baseURL}/users/${userId}`);
  return api.get(`/users/${userId}`).then((response) => response.data);
};

const getUserAllergies = async (userId) => {
  return api
    .get(`/users/${userId}/allergies`)
    .then((response) => response.data);
};

const updateAllergyNote = async (patientId, allergyId, note) => {
  try {
    console.log(
      `Updating allergy note for patientId: ${patientId}, allergyId: ${allergyId}`
    );
    const response = await api.patch(
      `/users/allergy/note/${patientId}/${allergyId}`,
      { note }
    );
    console.log('API response for updateAllergyNote:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating allergy note:', error);
    throw error;
  }
};

const getUserVaccinations = async (userId) => {
  return api
    .get(`/users/${userId}/vaccinations/`)
    .then((response) => response.data);
};

const updateVaccinationNote = async (patientId, vaccinationId, note) => {
  try {
    console.log(
      `Updating vaccination note for patientId: ${patientId}, vaccinationId: ${vaccinationId}`
    );
    const response = await api.patch(
      `/users/vaccination/note/${patientId}/${vaccinationId}`,
      { note }
    );
    console.log('API response for updateVaccinationNote:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating vaccination note:', error);
    throw error;
  }
};

const getUserQualifications = async (userId) => {
  return api
    .get(`/users/${userId}/qualifications/`)
    .then((response) => response.data);
};

const getUserSchedules = async (userId) => {
  return api
    .get(`/users/${userId}/schedules`)
    .then((response) => response.data);
};

const registerUser = async (userData) => {
  console.log('POST request to:', `${api.defaults.baseURL}/register`);
  return api.post('/register', userData).then((response) => response.data);
};

const loginUser = async (loginData) => {
  console.log('POST request to:', `${api.defaults.baseURL}/login`);
  return api.post('/login', loginData).then((response) => response.data);
};

const logoutUser = async () => {
  return api.post('/logout').then((response) => response.data);
};

const saveUserData = async (userId, index, formData) => {
  const endpointMap = {
    0: `/users/${userId}`,
    1: `/users/allergies/${userId}`,
    2: `/users/vaccinations/${userId}`,
    3: `/users/qualifications/${userId}`,
  };

  const endpoint = endpointMap[index];

  try {
    if (index === 0) {
      console.log('Making Put request to:', endpoint);
      const response = await api.put(endpoint, formData);
      return response.data;
    } else {
      console.log('Making POST request to:', endpoint);
      const response = await api.post(endpoint, formData);
      return response.data;
    }
  } catch (error) {
    console.error(`Error saving data for tab index ${index}:`, error);
    throw error;
  }
};

const saveSchedule = async (physicianId, scheduleData) => {
  console.log(
    'POST request to save schedule:',
    `/users/${physicianId}/schedule`
  );
  return api
    .post(`/users/${physicianId}/schedule`, scheduleData)
    .then((response) => response.data);
};

const getSchedulesByDate = async (selectedDate) => {
  console.log('Front: Function `getSchedulesByDate` called');
  const utcDate = new Date(
    Date.UTC(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    )
  );
  console.log(
    'Front: Sending GET request to /users/schedules with UTC date:',
    utcDate
  );

  return api
    .get(`/users/schedules/${utcDate.toISOString()}`)
    .then((response) => {
      console.log('Front: Response received:', response.data);
      return response.data;
    })
    .catch((error) => {
      console.error(
        'Front: Error in GET request:',
        error.response ? error.response : error.message
      );
    });
};

const bookSlot = async (scheduleId, slotId, patientId) => {
  console.log(
    'POST request to book slot:',
    `/schedules/${scheduleId}/slots/${slotId}/book`
  );
  return api
    .post(`/schedules/${scheduleId}/slots/${slotId}/book`, { patientId })
    .then((response) => response.data)
    .catch((error) => {
      console.error('Error booking slot:', error);
      throw error;
    });
};

const updateSlotStatus = async (scheduleId, slotId, status, userId) => {
  console.log(
    `PATCH request to update slot status: /schedules/${scheduleId}/slots/${slotId}`
  );
  return api
    .patch(`/schedules/${scheduleId}/slots/${slotId}`, { status, userId })
    .then((response) => response.data)
    .catch((error) => {
      console.error('Error updating slot status:', error);
      throw error;
    });
};

const deleteScheduleSlot = async (scheduleId, slotId) => {
  return api
    .delete(`/schedules/${scheduleId}/slots/${slotId}`)
    .then((response) => response.data)
    .catch((error) => {
      console.error('Error deleting slot:', error);
      throw error;
    });
};

const getPhysicianAppointments = async (physicianId) => {
  console.log('Fetching appointments for physician:', physicianId);
  return api
    .get(`/users/${physicianId}/appointments`)
    .then((response) => response.data);
};

const checkAuth = async () => {
  return api
    .get('/check-auth', { withCredentials: true })
    .then((response) => {
      console.log('Check Auth Response:', response);
      return response.data;
    })
    .catch((error) => {
      console.error('Check Auth Error:', error);
    });
};

export default {
  getUserInfo,
  getUserAllergies,
  updateAllergyNote,
  getUserVaccinations,
  updateVaccinationNote,
  getUserQualifications,
  getUserSchedules,
  registerUser,
  loginUser,
  logoutUser,
  saveUserData,
  saveSchedule,
  getSchedulesByDate,
  bookSlot,
  updateSlotStatus,
  deleteScheduleSlot,
  getPhysicianAppointments,
  checkAuth,
};
