const mongoose = require('mongoose');

// Single source of truth: embedded payment records. Total paid / pending
// amounts are DERIVED from them on every read and never stored — there is
// no second amount field that could conflict.
// - Payment status Paid / Pending comes from the requirements field names
//   ("Total paid", "Pending amount") — human must confirm the value set.
// - Contract is a plain string reference (storage mechanism undefined).
// - No vendor-name uniqueness (uniqueness rules undefined).

const vendorPaymentSchema = new mongoose.Schema(
  {
    amountCents: {
      type: Number,
      required: true,
      min: [0, 'Payment amount must be a valid non-negative financial amount'],
      validate: {
        validator: Number.isInteger,
        message: 'Payment amount must be stored as integer minor units'
      }
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['Paid', 'Pending'],
        message: 'Payment status must be Paid or Pending'
      }
    },
    date: {
      type: Date,
      default: null
    },
    reference: {
      type: String,
      default: null,
      trim: true
    }
  },
  { _id: true }
);

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vendor name is required'],
      trim: true
    },
    contact: {
      type: String,
      required: [true, 'Contact is required'],
      trim: true
    },
    serviceProvided: {
      type: String,
      default: null,
      trim: true
    },
    paymentTerms: {
      type: String,
      required: [true, 'Payment terms are required'],
      trim: true
    },
    contract: {
      type: String,
      default: null,
      trim: true
    },
    payments: {
      type: [vendorPaymentSchema],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vendor', vendorSchema);
