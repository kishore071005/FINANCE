const mongoose = require('mongoose');

// Monetary precision: amounts are stored as integer minor units (cents).
// - API accepts major-unit decimals (e.g. 100.50) and the service converts
//   them with string parsing (never binary float math) into `amountCents`.
// - Currency is NOT defined (see DO-NOT-GUESS-RULES) — no currency field,
//   no conversion, no tax calculation. `taxCents` is stored as provided.
// - No unique index on invoiceNumber: uniqueness requirements are undefined
//   and must be decided by the human (flagged ambiguity).

const revenueSchema = new mongoose.Schema(
  {
    customer: {
      type: String,
      required: [true, 'Customer is required'],
      trim: true
    },
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice Number is required'],
      trim: true
    },
    invoiceDate: {
      type: Date,
      required: [true, 'Invoice Date is required']
    },
    amountCents: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be a non-negative financial amount'],
      validate: {
        validator: Number.isInteger,
        message: 'Amount must be stored as integer minor units'
      }
    },
    taxCents: {
      type: Number,
      default: 0,
      min: [0, 'Tax must be a non-negative financial amount'],
      validate: {
        validator: Number.isInteger,
        message: 'Tax must be stored as integer minor units'
      }
    },
    dueDate: {
      type: Date,
      default: null
    },
    paymentDate: {
      type: Date,
      default: null
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['Pending', 'Partially Paid', 'Paid', 'Overdue'],
        message: 'Payment Status must be one of: Pending, Partially Paid, Paid, Overdue'
      },
      default: 'Pending'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Revenue', revenueSchema);
