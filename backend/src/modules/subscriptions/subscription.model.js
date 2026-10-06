const mongoose = require('mongoose');

// Monetary precision: integer minor units (cents).
// - `costCents`: per-cycle amount as entered (monthly amount for Monthly,
//   annual amount for Annual). `normalizedMonthlyCents`: explicit conversion
//   (Monthly → as-is; Annual → Math.round(cost / 12)). Documented in docs/api.md.
// - Billing cycle: strict Monthly / Annual only.
// - Status: Active / Inactive (values inferred from test-cases TC12 +
//   "Active vs inactive status handling" — human must confirm).
// - NO upcoming-renewal time window: renewals are surfaced sorted by date
//   with no day-cutoff (window undefined — flagged).

const subscriptionSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true
    },
    provider: {
      type: String,
      default: null,
      trim: true
    },
    category: {
      type: String,
      default: null,
      trim: true
    },
    costCents: {
      type: Number,
      required: [true, 'Cost is required'],
      min: [0, 'Cost must be a valid non-negative financial amount'],
      validate: {
        validator: Number.isInteger,
        message: 'Cost must be stored as integer minor units'
      }
    },
    billingCycle: {
      type: String,
      required: [true, 'Billing cycle is required'],
      enum: {
        values: ['Monthly', 'Annual'],
        message: 'Billing cycle must be Monthly or Annual'
      }
    },
    normalizedMonthlyCents: {
      type: Number,
      required: true,
      min: [0, 'Normalized monthly cost cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Normalized monthly cost must be stored as integer minor units'
      }
    },
    startDate: {
      type: Date,
      default: null
    },
    renewalDate: {
      type: Date,
      required: [true, 'Renewal date is required']
    },
    paymentMethod: {
      type: String,
      default: null,
      trim: true
    },
    owner: {
      type: String,
      default: null,
      trim: true
    },
    department: {
      type: String,
      default: null,
      trim: true
    },
    status: {
      type: String,
      enum: {
        values: ['Active', 'Inactive'],
        message: 'Status must be Active or Inactive'
      },
      default: 'Active'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
