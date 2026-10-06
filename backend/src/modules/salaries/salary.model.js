const mongoose = require('mongoose');

// Monetary precision: integer minor units (cents), same as other modules.
// - `grossCents`: salary / stipend as provided. `deductionsCents`: applicable
//   deductions total as provided (no tax/payroll computation — rules undefined).
// - `netCents` (monthly cost / actual payment) = gross − deductions, computed
//   in the service layer with integer math.
// - Employment type, payment status: free-text optional (values undefined).
// - All amounts are treated as MONTHLY figures. No annualization or period
//   conversion exists (that would invent payroll rules).

const salarySchema = new mongoose.Schema(
  {
    employee: {
      type: String,
      required: [true, 'Employee is required'],
      trim: true
    },
    grossCents: {
      type: Number,
      required: [true, 'Salary is required'],
      min: [0, 'Salary must be a valid non-negative financial amount'],
      validate: {
        validator: Number.isInteger,
        message: 'Salary must be stored as integer minor units'
      }
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true
    },
    employmentType: {
      type: String,
      default: null,
      trim: true
    },
    deductionsCents: {
      type: Number,
      default: 0,
      min: [0, 'Deductions must be a valid non-negative financial amount'],
      validate: {
        validator: Number.isInteger,
        message: 'Deductions must be stored as integer minor units'
      }
    },
    netCents: {
      type: Number,
      required: true,
      min: [0, 'Net pay cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Net pay must be stored as integer minor units'
      }
    },
    paymentStatus: {
      type: String,
      default: null,
      trim: true
    },
    paymentDate: {
      type: Date,
      default: null
    },
    notes: {
      type: String,
      default: null,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Salary', salarySchema);
