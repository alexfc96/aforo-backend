const mongoose = require('mongoose');

const { Schema } = mongoose;

const bookingSchema = new Schema(
  {
    idUser: { type: Schema.Types.ObjectId, ref: 'User', trim:true},
    idEstablishment: { type: Schema.Types.ObjectId, ref: 'Establishment', trim:true},
    day: { type: Date, required: true, min: '2020-01-01', max: '2025-01-01' },
    startHour: { type: String, required: true },
    timeBetweenBookings: { type: Number },
  },
  {
    timestamps: {
      createdAt: 'created_at',
    },
  },
);

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
