const mongoose = require('mongoose');

// Monetary precision: integer minor units (cents) for renewal + hosting costs.
// Required: domain name, registrar, renewal date, renewal cost, hosting
// provider, hosting cost (per Phase 5 task scope — flagged for human review,
// since associated hosting could alternatively be optional).
// Status: free-text optional (no values defined). No renewal time window.

const domainSchema = new mongoose.Schema(
  {
    domainName: {
      type: String,
      required: [true, 'Domain name is required'],
      trim: true
    },
    registrar: {
      type: String,
      required: [true, 'Registrar is required'],
      trim: true
    },
    purchaseDate: {
      type: Date,
      default: null
    },
    renewalDate: {
      type: Date,
      required: [true, 'Renewal date is required']
    },
    renewalCostCents: {
      type: Number,
      required: [true, 'Renewal cost is required'],
      min: [0, 'Renewal cost must be a valid non-negative financial amount'],
      validate: {
        validator: Number.isInteger,
        message: 'Renewal cost must be stored as integer minor units'
      }
    },
    hostingProvider: {
      type: String,
      required: [true, 'Hosting provider is required'],
      trim: true
    },
    hostingCostCents: {
      type: Number,
      required: [true, 'Hosting cost is required'],
      min: [0, 'Hosting cost must be a valid non-negative financial amount'],
      validate: {
        validator: Number.isInteger,
        message: 'Hosting cost must be stored as integer minor units'
      }
    },
    status: {
      type: String,
      default: null,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Domain', domainSchema);
