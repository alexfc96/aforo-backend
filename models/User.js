const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true},
    username: { type: String, required: true, unique: true },
    hashedPassword: { type: String, required: true },
    mail: { type: String, required: true, unique: true }, //cambiarlo a email.
    years: Number,
    //role: ['Admin', 'client'],
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

const User = mongoose.model('User', userSchema);

module.exports = User;
