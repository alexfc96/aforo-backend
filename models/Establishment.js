const mongoose = require('mongoose');

const { Schema } = mongoose;

const establishmentSchema = new Schema(
  {
    name: { type: String, required: true },
    description: String,
    capacity: { type: Number, required: true },
    address: String,
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
    owners: [{ type: Schema.Types.ObjectId, ref: 'User' }],
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
