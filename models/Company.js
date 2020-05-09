const mongoose = require('mongoose');

const { Schema } = mongoose;

const companySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: String,
    owners: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    establishments: [{ type: Schema.Types.ObjectId, ref: 'Establishment' }],
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
