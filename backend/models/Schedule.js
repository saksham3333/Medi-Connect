const mongoose = require("mongoose");

const scheduleSlotSchema = new mongoose.Schema({
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  duration: { type: Number, required: true },
  breakStartTime: { type: String },
  breakEndTime: { type: String },
  status: {
    type: String,
    enum: ["Available", "Pending", "Booked", "Finished"],
    default: "available",
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
});

const scheduleSchema = new mongoose.Schema({
  physicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  slots: [scheduleSlotSchema],
  createdAt: { type: Date, default: Date.now },
});

const Schedule = mongoose.model("Schedule", scheduleSchema);
module.exports = Schedule;
