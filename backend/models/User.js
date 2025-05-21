const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const allergySchema = new mongoose.Schema({
  type: { type: String, required: true }, // allergy or intolerance
  category: { type: String }, // food, medication, etc.
  criticality: { type: String }, // low, high, unable-to-assess
  name: { type: String, required: true }, // specific allergen
  recordedDate: { type: Date },
  onsetDateTime: { type: Date },
  note: { type: String, default: "Not Yet Provided" }, // optional notes
});

const vaccinationSchema = new mongoose.Schema({
  vaccineCode: { type: String, required: true }, // vaccine name or code
  status: { type: String }, // completed, not-done, etc.
  date: { type: Date },
  doseNumber: { type: String }, // 1st dose, 2nd dose, etc.
  provider: { type: String }, // healthcare provider
  note: { type: String, default: "Not Yet Provided" }, // optional notes
});

const qualificationSchma = new mongoose.Schema({
  type: { type: String, required: true }, //  qualifications, certifications, accreditations, licenses, training, others
  name: { type: String }, // qualification name
  startDate: { type: Date },
  endDate: { type: Date },
  issuer: { type: String }, // issuing organization
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, required: true },
  role: { type: String, required: true }, // Patients or Physicians
  allergies: [allergySchema], // Embedded allergy information
  vaccinations: [vaccinationSchema], // Embedded vaccination information
  qualifications: [qualificationSchma], // Embedded qualification information
  schedules: [
    {
      scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Schedule" },
      slotId: { type: mongoose.Schema.Types.ObjectId },
      slotStartTime: String,
      slotEndTime: String,
      location: String,
      physicianId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: String,
    },
  ],
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    return next(error);
  }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
