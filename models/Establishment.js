const mongoose = require('mongoose');

const { Schema } = mongoose;

const establishmentSchema = new Schema(
  {
    name: { type: String, required: true },
    description: String,
    capacity: { type: Number, required: true }, //hacerlo objeto y dar la opcion de cambiar el tantop por ciento de ocuapcion maxima al admin?
    address: String,
    timetable: {
      startHourShift: { type: Number, required: true },
      finalHourShift: { type: Number, required: true },
      timeAllowedPerBooking: { type: Number, required: true },
    },
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
    owners: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    //workers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    clients: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

const Establishment = mongoose.model('Establishment', establishmentSchema);

module.exports = Establishment;
