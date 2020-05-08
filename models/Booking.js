const mongoose = require('mongoose');

const { Schema } = mongoose;

const bookingSchema = new Schema(
  {
    IDUser: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    IDEstablishment: [{ type: Schema.Types.ObjectId, ref: 'Establishment' }],
    StartHour: { type: Date, required: true },
    EndingTime: { type: Date, required: true },
  },
);

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
