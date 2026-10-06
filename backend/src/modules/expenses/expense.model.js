const mongoose = require('mongoose');

// Monetary precision: integer minor units (cents), same as Revenue.
// Currency is NOT defined — no currency field or conversion.
// Status / payment method / receipt storage are undefined by the harness,
// so they are stored as plain optional strings with NO enum and NO validation
// beyond type. Vendor is a basic string link (full Vendors module is Phase 6).
// Department master-data source is undefined — stored as a required string.

const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'Salaries',
          'SaaS',
          'Software',
          'Domain',
          'Hosting',
          'Cloud',
          'Hardware',
          'Office',
          'Marketing',
          'Travel',
          'Operations',
          'Professional services',
          'Other'
        ],
        message: 'Category must be one of the allowed expense categories'
      }
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    amountCents: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be a valid non-negative financial amount'],
      validate: {
        validator: Number.isInteger,
        message: 'Amount must be stored as integer minor units'
      }
    },
    date: {
      type: Date,
      required: [true, 'Date is required']
    },
    vendor: {
      type: String,
      required: [true, 'Vendor is required'],
      trim: true
    },
    paymentMethod: {
      type: String,
      default: null,
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true
    },
    receipt: {
      type: String,
      default: null,
      trim: true
    },
    status: {
      type: String,
      default: null,
      trim: true
    },
    notes: {
      type: String,
      default: null,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
