const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Schedule = require("../models/Schedule");

router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

router.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    Object.assign(user, updatedData);

    await user.save();

    res
      .status(200)
      .json({ message: "User information updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating user information", error });
  }
});

router.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user" });
  }
});

router.get("/users/:id/allergies", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select("allergies");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user.allergies);
  } catch (error) {
    res.status(500).json({ error: "Error fetching allergies" });
  }
});

router.patch("/users/allergy/note/:patientId/:allergyId/", async (req, res) => {
  const { patientId, allergyId } = req.params;
  const { note } = req.body;
  console.log(
    `Received request to update allergy note: patientId=${patientId}, allergyId=${allergyId}, note=${note}`
  );
  try {
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "User not found" });
    }

    const allergy = patient.allergies.id(allergyId);
    if (!allergy) {
      return res.status(404).json({ message: "Allergy not found" });
    }

    allergy.note = note;
    await patient.save();

    res
      .status(200)
      .json({ message: "Allergy note updated successfully", allergy });
  } catch (error) {
    res.status(500).json({ message: "Error updating allergy note", error });
  }
});

router.get("/users/:id/vaccinations", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select("vaccinations");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user.vaccinations);
  } catch (error) {
    res.status(500).json({ error: "Error fetching allergies" });
  }
});

router.patch(
  "/users/vaccination/note/:patientId/:vaccinationId/",
  async (req, res) => {
    const { patientId, vaccinationId } = req.params;
    const { note } = req.body;
    console.log(
      `Received request to update vaccination note: patientId=${patientId}, allergyId=${vaccinationId}, note=${note}`
    );
    try {
      const patient = await User.findById(patientId);
      if (!patient) {
        return res.status(404).json({ message: "User not found" });
      }

      const vaccination = patient.vaccinations.id(vaccinationId);
      if (!vaccination) {
        return res.status(404).json({ message: "Vaccination not found" });
      }

      vaccination.note = note;
      await patient.save();

      res.status(200).json({
        message: "Vaccination note updated successfully",
        vaccination,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating vaccination note", error });
    }
  }
);

router.get("/users/:id/qualifications", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select("qualifications");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user.qualifications);
  } catch (error) {
    res.status(500).json({ error: "Error fetching qualifications" });
  }
});

router.get("/users/:id/schedules", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).populate({
      path: "schedules.scheduleId",
      populate: { path: "physicianId", select: "firstName lastName" },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const scheduleData = user.schedules.map((entry) => {
      const { scheduleId, slotId } = entry;
      const slot = scheduleId.slots.id(slotId);

      return {
        scheduleId: scheduleId._id,
        slotId: slot._id,
        date: scheduleId.date,
        location: scheduleId.location,
        physicianName: `${scheduleId.physicianId.firstName} ${scheduleId.physicianId.lastName}`,
        startTime: slot.startTime,
        endTime: slot.endTime,
        duration: slot.duration,
        status: slot.status,
      };
    });

    res.status(200).json(scheduleData);
  } catch (error) {
    console.error("Error fetching user schedules:", error);
    res.status(500).json({ message: "Error fetching user schedules", error });
  }
});

router.post("/users/allergies/:id", async (req, res) => {
  const { id } = req.params;
  const allergyData = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.allergies.push(allergyData);
    await user.save();

    res.status(200).json({ message: "Allergy data saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error saving allergy data", error });
  }
});

router.post("/users/vaccinations/:id", async (req, res) => {
  const { id } = req.params;
  const vaccinationData = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.vaccinations.push(vaccinationData);
    await user.save();

    res.status(200).json({ message: "Vaccination data saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error saving vaccination data", error });
  }
});

router.post("/users/qualifications/:id", async (req, res) => {
  const { id } = req.params;
  const qualificationData = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.qualifications.push(qualificationData);
    await user.save();

    res.status(200).json({ message: "Qualification data saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error saving qualification data", error });
  }
});

router.post("/register", async (req, res) => {
  const {
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
    dateOfBirth,
    gender,
    role,
  } = req.body;

  console.log("Received registration data:", {
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
    const newUser = new User({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth,
      gender,
      role,
    });

    await newUser.save();
    res.status(201).send("User registered successfully");
  } catch (error) {
    console.error("Error while registering user:", error);
    res.status(400).send(error.message);
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Received login request:", req.body);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found with the given ID");
      return res.status(400).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Invalid credentials");
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 3600000,
    });

    console.log("Login successful, token generated:", token);
    res.status(200).json({ token, user, message: "Login successful" });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Server error" });
  }
});

const verifyToken = (req, res, next) => {
  console.log("Cookies received:", req.cookies);

  const token = req.cookies.token;
  if (!token) {
    console.log("No token found in cookies");
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("Invalid token:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

router.get("/check-auth", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "firstName email role"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/users/:id/schedule", async (req, res) => {
  const { id } = req.params;
  const { date, location, slots, breakStartTime, breakEndTime, interval } =
    req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User found:", user);

    const existingSchedule = await Schedule.findOne({
      physicianId: id,
      date: new Date(date),
    });

    if (existingSchedule) {
      return res.status(400).json({
        message: "A schedule already exists on the selected date.",
      });
    }

    const newSchedule = new Schedule({
      physicianId: id,
      date: new Date(date),
      location,
      slots,
      breakStartTime,
      breakEndTime,
      interval,
    });

    console.log("New Schedule:", newSchedule);

    await newSchedule.save();

    user.schedules.push(newSchedule._id);
    await user.save();

    res.status(201).json({
      message: "Schedule created successfully",
      schedule: newSchedule,
    });
  } catch (error) {
    console.error("Error creating schedule:", error);
    res.status(500).json({ message: "Error creating schedule", error });
  }
});

router.get("/users/schedules/:date", async (req, res) => {
  const { date } = req.params;
  console.log("Back: Received GET request for date:", date);

  try {
    const dateOnly = new Date(date).toISOString().split("T")[0];
    const startOfDay = new Date(`${dateOnly}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateOnly}T23:59:59.999Z`);

    console.log("Back: Start of day:", startOfDay);
    console.log("Back: End of day:", endOfDay);

    const schedules = await Schedule.find({
      date: { $gte: startOfDay, $lt: endOfDay },
    }).populate({
      path: "physicianId",
      select: "firstName lastName",
    });

    if (!schedules || schedules.length === 0) {
      console.log("Back: No schedules found for this date");
      return res
        .status(404)
        .json({ message: "Back: No schedules found for this date" });
    }

    console.log("Back: Schedules found:", schedules);
    res.status(200).json(schedules);
  } catch (error) {
    console.error("Back: Error fetching schedules:", error);
    res.status(500).json({ message: "Back: Error fetching schedules", error });
  }
});

router.post("/schedules/:scheduleId/slots/:slotId/book", async (req, res) => {
  const { scheduleId, slotId } = req.params;
  const { patientId } = req.body;

  try {
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).send({ message: "Schedule not found" });
    }

    const slot = schedule.slots.id(slotId);
    if (!slot) {
      return res.status(404).send({ message: "Slot not found" });
    }

    slot.status = "Pending";
    slot.bookedBy = patientId;

    await schedule.save();

    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).send({ message: "Patient not found" });
    }

    const existingSchedule = patient.schedules.find(
      (s) =>
        s.scheduleId &&
        s.scheduleId.equals(scheduleId) &&
        s.slotId &&
        s.slotId.equals(slotId)
    );
    if (!existingSchedule) {
      patient.schedules.push({
        scheduleId: schedule._id,
        slotId: slot._id,
      });
      await patient.save();
    } else {
      return res.status(400).send({
        message: "This slot has already been booked by this patient.",
      });
    }

    res.status(200).send({ message: "Slot booked successfully", schedule });
  } catch (error) {
    console.error("Error booking slot:", error);
    res.status(500).send({ error: "Failed to book the slot" });
  }
});

router.patch("/schedules/:scheduleId/slots/:slotId", async (req, res) => {
  const { scheduleId, slotId } = req.params;
  const { status, userId } = req.body;

  console.log("Received scheduleId:", scheduleId);
  console.log("Received slotId:", slotId);
  console.log("Received userId:", userId);
  console.log("Received status:", status);

  try {
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    const slot = schedule.slots.id(slotId);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    slot.bookedBy = status === "Available" ? null : slot.bookedBy;

    await schedule.save();

    if (status === "Available") {
      slot.status = "Available";

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      user.schedules = user.schedules.filter(
        (s) =>
          !(
            s.scheduleId.toString() === scheduleId &&
            s.slotId.toString() === slotId
          )
      );

      await user.save();
      await schedule.save();
      return res
        .status(200)
        .json({ message: "Slot status updated to Available" });
    }

    if (slot.status === "Pending" && status === "Booked") {
      slot.status = "Booked";
      await schedule.save();
      return res.status(200).json({ message: "Slot status updated to Booked" });
    }

    if (slot.status === "Booked" && status === "Finished") {
      slot.status = "Finished";
      await schedule.save();
      return res
        .status(200)
        .json({ message: "Slot status updated to Finished" });
    }

    res.status(200).json({ message: "Slot status updated successfully" });
  } catch (error) {
    console.error("Error updating slot status:", error);
    res.status(500).json({ message: "Error updating slot status", error });
  }
});

router.delete("/schedules/:scheduleId/slots/:slotId", async (req, res) => {
  const { scheduleId, slotId } = req.params;

  try {
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    schedule.slots = schedule.slots.filter(
      (slot) => slot._id.toString() !== slotId
    );

    await schedule.save();
    res.status(200).json({ message: "Slot deleted successfully" });
  } catch (error) {
    console.error("Error deleting slot:", error);
    res.status(500).json({ message: "Error deleting slot", error });
  }
});

router.get("/users/:id/appointments", async (req, res) => {
  const { id } = req.params;

  try {
    const schedules = await Schedule.find({ physicianId: id })
      .populate(
        "slots.bookedBy",
        "email firstName lastName phoneNumber dateOfBirth gender allergies vaccinations"
      )
      .exec();

    const appointments = schedules.flatMap((schedule) =>
      schedule.slots.map((slot) => ({
        scheduleId: schedule._id,
        slotId: slot._id,
        date: schedule.date,
        status: slot.status,
        startTime: slot.startTime,
        endTime: slot.endTime,
        location: schedule.location,
        bookedPatientId: slot.bookedBy ? slot.bookedBy._id : null,
        patientInfo: slot.bookedBy
          ? {
              patientId: `${slot.bookedBy._id}`,
              email: `${slot.bookedBy.email}`,
              name: `${slot.bookedBy.firstName} ${slot.bookedBy.lastName}`,
              phoneNumber: `${slot.bookedBy.phoneNumber}`,
              dateOfBirth: `${slot.bookedBy.dateOfBirth}`,
              gender: `${slot.bookedBy.gender}`,
              allergies: `${slot.bookedBy.allergies}`,
              vaccinations: `${slot.bookedBy.vaccinations}`,
            }
          : null,
      }))
    );

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching physician appointments:", error);
    res.status(500).json({ error: "Error fetching appointments" });
  }
});

router.get("/schedules", async (req, res) => {
  try {
    const schedules = await Schedule.find();
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ message: "Logged out" });
});

module.exports = router;
