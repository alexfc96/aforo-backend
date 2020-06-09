const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true},
    username: { type: String, required: true, unique: true },
    hashedPassword: { type: String, required: true },
    mail: { type: String, required: true, unique: true },
    years: Number,
    favoriteEstablishments: [{ type: Schema.Types.ObjectId, ref: 'Establishment' }]
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
