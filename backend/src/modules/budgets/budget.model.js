const mongoose = require('mongoose');

// Departments: strict harness list (HR, Sales, Marketing, Operations,
// Technology, Other). No unique index on department (uniqueness undefined).
// Actual spending is NEVER stored — derived per read from the Expense and
// Salary collections (see budget.service.js). No alert threshold exists.

const budgetSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: {
        values: ['HR', 'Sales', 'Marketing', 'Operations', 'Technology', 'Other'],
        message: 'Department must be one of: HR, Sales, Marketing, Operations, Technology, Other'
      }
    },
    budgetCents: {
      type: Number,
      required: [true, 'Budget is required'],
      min: [0, 'Budget must be a valid non-negative financial amount'],
      validate: {
        validator: Number.isInteger,
        message: 'Budget must be stored as integer minor units'
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Budget', budgetSchema);
