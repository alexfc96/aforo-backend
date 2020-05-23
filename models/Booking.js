const mongoose = require('mongoose');

const { Schema } = mongoose;

const bookingSchema = new Schema(
  {
    idUser: { type: Schema.Types.ObjectId, ref: 'User', trim:true},
    idEstablishment: { type: Schema.Types.ObjectId, ref: 'Establishment', trim:true},
    startTime: { type: Number, required: true },
    endingTime: { type: Number, required: true },
  },
  {
    timestamps: {
      createdAt: 'created_at',
    },
  },
);

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
