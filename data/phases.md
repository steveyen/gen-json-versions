# The Sweet Spot: Evolving Data for a Bakery Employee Scheduling App

Let's simulate a scenario where a small bakery, "The Sweet Spot",
gradually expands its operations. As their business grows, so do the
needs for team scheduling, where they've started tracking their
team scheduling data as JSON records.

We'll be working with JSON data schemas throughout this project
and the bakery's evolution through multiple schema versions and feature
enhancements that were requested by the bakery owner.

## Phase 1: The Bare Bones Schedule

### Data Version v1.0: The Start

"As the bakery owner, I need a simple way to create
a weekly schedule that lists which employee is working on which day
and their assigned shift (e.g., Morning Bake, Afternoon Cashier, etc)."

To start, we'll have multiple JSON objects, one JSON document per
daily schedule. Each schedule object will specify the `date`
and an array of `assignments`. Each `assignment` will
link an `empName` to a `shift`.

#### Example JSON v1.0:

```json {
  "scheds": [
    {
      "id": "sched-000001",
      "date": "2025-05-19",
      "assignments": [
        {
          "empName": "Alice Wonderland",
          "shift": "Morning Bake (6 AM - 2 PM)",
          "^shift": {
            "values": [
              "Morning Bake (6 AM - 2 PM)",
              "Morning Cashier (7 AM - 1 PM)",
              "Afternoon Cashier (12 PM - 8 PM)"
            ]
          }
        },
        {
          "empName": "Bob The Baker",
          "shift": "Afternoon Cashier (12 PM - 8 PM)"
        }
      ]
    },
    {
      "id": "sched-000002",
      "date": "2025-05-20",
      "assignments": [
        {
          "empName": "Alice Wonderland",
          "shift": "Morning Bake (6 AM - 2 PM)"
        },
        {
          "empName": "Charlie Chocolatier",
          "shift": "Afternoon Cashier (12 PM - 8 PM)"
        }
      ]
    }
  ]
}
```

## Phase 2: Growing Pains & Staff Management

A few months later, The Sweet Spot is doing well!

They've hired more staff and need better ways to manage
employee information and define shifts more formally.

### Data Version v2.0: Centralized Employee Roster

"We have more staff now, and just typing names is
leading to inconsistencies. I need a separate place to
manage employee details like their full name and a
unique employee ID. When scheduling, I want to refer to
these employees by their ID."

- Introduce employee JSON records.

Each employee will have an `empId` (a unique identifier,
perhaps a number or a short string like "emp-0001")
and a `fullName`.

- From now on, a schedule will refer to `empId`
  instead of `empName`.

#### Example JSON v2.0:

```json {
  "emps": [
    {
      "id": "emp-0001",
      "fullName": "Alice Wonderland",
      "contactPhone": "555-1234" // Added for more complete employee info
    }, {
      "id": "emp-0002",
      "fullName": "Bob The Baker",
      "contactPhone": "555-5678"
    }, {
      "id": "emp-0003",
      "fullName": "Charlie Chocolatier",
      "contactPhone": "555-8765"
    }
  ],
  "scheds": [
    {
      "id": "sched-000003",
      "date": "2025-07-21",
      "assignments": [
        {
          "empId": "emp-0001", // Changed from empName
          "shift": "Morning Bake (6 AM - 2 PM)"
        }, {
          "empId": "emp-0002",
          "shift": "Afternoon Cashier (12 PM - 8 PM)"
        }
      ]
    } // ...
  ]
}
```

### Data Version v2.1: Standardized Shift Definitions

"Typing out shift details like 'Morning Bake (6 AM - 2 PM)' every time is
tedious and error-prone. We need to define standard shifts (e.g., 'Morning
Baker', 'Afternoon Cashier', 'Evening Prep') with set start and end times,
and then assign employees to these predefined shifts."

- Introduce another new top-level array called `definedShifts`.

Each object in this array will have a `id` (unique identifier,
e.g., "shift-ms001"), a `name` (e.g., "Morning Baker"),
`startTime` (e.g., "06:00"), and `endTime` (e.g., "14:00").

- In the `assignments` of a daily `schedule`, instead of a
  free-text `shift` description, we'll now use `shiftId` to
  link to the new `definedShifts` array.

#### Example JSON v2.1:

```json {
  "emps": [
    // ... (as in v2.0)
  ],
  "definedShifts": [
    {
      "id": "shift-ms001",
      "name": "Morning Baker",
      "startTime": "06:00",
      "endTime": "14:00",
      "description": "Primary baking shift for breads and morning pastries."
    }, {
      "id": "shift-mc011",
      "name": "Morning Cashier",
      "startTime": "07:00",
      "endTime": "13:00",
      "description": "Customer service and sales at the counter."
    }, {
      "id": "shift-ac001",
      "name": "Afternoon Cashier",
      "startTime": "12:00",
      "endTime": "20:00",
      "description": "Customer service and sales at the counter."
    }, {
      "id": "shift-ep001",
      "name": "Evening Prep",
      "startTime": "16:00",
      "endTime": "22:00",
      "description": "Preparing ingredients and doughs for the next day."
    }
  ],
  "scheds": [
	  {
      "id": "sched-000004",
	    "date": "2025-09-15",
      "assignments": [
        {
          "empId": "emp-0001",
          "shiftId": "shift-ms001" // Changed from free-text shift
        }, {
          "empId": "emp-0002",
          "shiftId": "shift-ac001"
        }
      ]
    } // ...
  ]
}
```

## Phase 3: Specialization and Availability

The Sweet Spot is now a bustling local favorite! They have specialized
roles and staff have different availability constraints.

### Data Version v3.0: Employee Roles & Shift Suitability

"Some of my staff are trained as bakers, others mainly for counter service, and
some are good at cake decorating. I need to track employee roles. Also, not
every shift is suitable for every role (e.g., a cashier can't cover a 'Master
Baker' shift). It would be great if, when assigning shifts, we could see which
roles are suitable for that shift."

- Add a `roles` array to each object in the `employees` array (e.g., `roles:
  ["Baker", "Cashier"]`). An employee can have multiple roles.  - Add an
  `eligibleRoles` array to each object in the `definedShifts` array (e.g.,
  `eligibleRoles: ["Baker", "Lead Baker"]`). This indicates which roles can be
  assigned to this shift.

#### Example JSON v3.0:

```json {
  "emps": [
    {
      "id": "emp-0001",
      "fullName": "Alice Wonderland",
      "contactPhone": "555-1234",
      "roles": ["Baker", "Cake Decorator"], // New field
      "^roles": {
        "values": ["Baker", "Cake Decorator", "Lead Baker", "Cashier", "Barista", "Utility"]
      }
    }, {
      "id": "emp-0002",
      "fullName": "Bob The Baker",
      "contactPhone": "555-5678",
      "roles": ["Baker"] // New field
    }, {
      "id": "emp-0004", // New employee
      "fullName": "Diana Dishwasher",
      "contactPhone": "555-1122",
      "roles": ["Cashier", "Utility"] // New field
    }
  ],
  "definedShifts": [
    {
      "id": "shift-ms001",
      "name": "Morning Baker",
      "startTime": "06:00",
      "endTime": "14:00",
      "description": "Primary baking shift for breads and morning pastries.",
      "eligibleRoles": ["Baker", "Lead Baker"], // New field
      "^eligibleRoles": {
        "values": ["Baker", "Cake Decorator", "Lead Baker", "Cashier", "Barista", "Utility"]
      }
    }, {
      "id": "shift-ac001",
      "name": "Afternoon Cashier",
      "startTime": "12:00",
      "endTime": "20:00",
      "description": "Customer service and sales at the counter.",
      "eligibleRoles": ["Cashier"] // New field
    } // ...
  ],
  "scheds": [
    // ... (structure remains the same, but assignments now implicitly link to
    // employees with roles and shifts with eligible roles)
  ]
}
```

### Data Version v3.1: Employee Unavailability & Time Off Requests

"Staff need to be able to request time off, and I need to mark their
unavailability (e.g., student only works evenings, someone has a recurring
Tuesday morning appointment). The system should prevent me from accidentally
scheduling someone when they are unavailable."

- Add an `unavailability` array to each `employee` object.
  Each item in this array is an object specifying `startDate`,
  `endDate`, `startTime` (optional), `endTime` (optional),
  `reason` (e.g., "Vacation," "Doctor's Appointment," "Class"),
  and `status` (e.g., "Requested", "Approved", "Denied").

#### Example JSON v3.1:

```json {
  "emps": [
    {
      "id": "emp-0001",
      "fullName": "Alice Wonderland",
      "contactPhone": "555-1234",
      "roles": ["Baker", "Cake Decorator"],
      "unavailability": [ // New field
        {
          "requestId": "to001", // Optional: to track individual requests
          "type": "Time Off", // "Time Off", "Recurring Unavailability"
          "startDate": "2025-10-20",
          "endDate": "2025-10-22",
          "reason": "Vacation",
          "status": "Approved", // "Requested", "Approved", "Denied"
          "^status": {
            "values": ["Requested", "Approved", "Denied"]
          }
        }, {
          "requestId": "ru001",
          "type": "Recurring Unavailability",
          "dayOfWeek": "Tuesday", // For recurring
          "startTime": "09:00",
          "endTime": "12:00",
          "reason": "Class",
          "status": "Approved"
        }
      ]
    } // ...
  ],
  "definedShifts": [
    // ... (as in v3.0)
  ],
  "scheds": [
    // ... (structure remains the same,
    //      but scheduling logic now needs to check unavailability)
  ]
}
```

## Phase 4: Workflow Enhancements & Reporting

The Sweet Spot is thriving and opening a second, smaller
kiosk location! They need more robust scheduling features.

### Data Version v4.0: Multiple Locations

"We're opening a kiosk at the farmer's market! I need to create schedules for
different locs ('Main Bakery', 'Market Kiosk') and assign staff to shifts
at specific locs."

- We'll introduce a new top-level array `locs`. Each location
  will have `locId` (e.g., "loc01") and
  a `locationName` (e.g., "Main Bakery").

- Add `locId` to each `definedShift` object. This means a
  shift definition is now tied to a location (e.g., "Morning Baker
  at Main Bakery" is different from "Morning Kiosk Seller at Market Kiosk").

#### Example JSON v4.0:

```json {
  "emps": [
    // ... (as in v3.1)
  ],
  "locs": [ // New top-level entity
    {
      "id": "loc-0001",
      "name": "Main Bakery",
      "address": "123 Main St"
    }, {
      "id": "loc-0002",
      "name": "Farmer's Market Kiosk",
      "address": "Green Park, Stall 15"
    }
  ],
  "definedShifts": [
    {
      "id": "shift-msb001", // More specific ID
      "locId": "loc-0001", // New field
      "name": "Morning Baker - Main",
      "startTime": "06:00",
      "endTime": "14:00",
      "description": "Primary baking shift for breads and morning pastries at the main bakery.",
      "eligibleRoles": ["Baker", "Lead Baker"]
    }, {
      "id": "shift-mkm001", // More specific ID
      "locId": "loc-0002", // New field
      "name": "Morning Seller - Kiosk",
      "startTime": "08:00",
      "endTime": "13:00",
      "description": "Selling pastries and coffee at the market kiosk.",
      "eligibleRoles": ["Cashier", "Barista"]
    } // ...
  ],
  "scheds": [
    {
      "id": "sched-000006",
      "date": "2025-12-01",
      "assignments": [
        {
          "empId": "emp-0001",
          "shiftId": "shift-msb001" // This shift is for the main bakery
        }, {
          "empId": "emp-0004",
          "shiftId": "shift-mkm001" // This shift is for the kiosk
        }
      ]
    }
  ]
}
```

### Data Version v4.1: Shift Swapping/Cover Requests & Audit Trail

"Staff often want to swap shifts or request someone to cover
their shift. I need a formal way to manage these requests,
get approvals, and see a history of who originally was
scheduled versus who actually worked it (an audit trail
for the assignment)."

- We'll modify the `assignment` object within a daily `schedule`.
  - Add an `originalEmpId` (if different from the current `employeeId`
    due to a swap/cover).
  - Add an `status` (e.g., "Scheduled",
    "SwapRequested", "CoverRequested", "SwapApproved", "CoverApproved").
  - Add a `changeHistory` array. Each item in this array could be
    an object with `datetime`, `changedByEmpId` (who initiated/approved),
    `previousEmpId`, `newEmpId`, `action` (e.g., "Swap Request",
    "Cover Approved by Manager"), and `notes`.

#### Example JSON v4.1:

```json {
  // ... emp, loc, definedShifts as in v4.0

  "scheds": [
    {
      "id": "sched-000005",
      "date": "2026-02-02",
      "assignments": [
        {
          // Currently assigned employee
          "empId": "emp-0002",
          // Who was originally scheduled
          "originalEmpId": "emp-0001",
          "shiftId": "shift-msb001",
          // New field
          "status": "CoverApproved",
          // New field
          "changeHistory": [
            {
              "datetime": "2026-01-28T10:00:00Z",
              "action": "Initial Assignment",
              "empId": "emp-0001", // Employee assigned
              "changedByEmpId": "schedulerBot" // Or manager's ID
            }, {
              "datetime": "2026-01-30T14:30:00Z",
              "action": "Cover Requested",
              "requestingEmpId": "emp-0001",
              "notes": "Feeling unwell."
            }, {
              "datetime": "2026-01-30T17:00:00Z",
              "action": "Cover Offered",
              "offeringEmpId": "emp-0002"
            }, {
              "datetime": "2026-01-31T09:00:00Z",
              "action": "Cover Approved by Manager",
              "approvingManagerId": "emp-0001", // Assuming a manager role/ID
              "previousEmpId": "emp-0001",
              "newEmpId": "emp-0002"
            }
	        ]
	      } // ... more assignments
      ]
    }
	]
}
```

## Phase 5: Advanced Business Operations & Analytics

The Sweet Spot has grown into a successful multi-location
business and needs more sophisticated features to manage
operations and analyze performance.

### Data Version v5.0: Labor Cost Tracking & Budget Management

"As we've grown, I need to track labor costs more precisely.
Each role should have an associated hourly rate, and I want to
be able to set weekly labor budgets per location. The system
should warn me if a schedule exceeds the budget."

- Add `hourlyRate` to each `role` in the `roles` array
- Add `laborBudget` to each `location` object
- Add `actualCost` to each `schedule` object
- Modify `assignment` to include `hoursWorked` and `calculatedCost`

#### Example JSON v5.0:

```json {
  "emps": [
    {
      "id": "emp-0001",
      "fullName": "Alice Wonderland",
      "contactPhone": "555-1234",
      "roles": [
        {
          "name": "Baker",
          "hourlyRate": 25.50,
          "effectiveDate": "2025-01-01"
        },
        {
          "name": "Cake Decorator",
          "hourlyRate": 28.75,
          "effectiveDate": "2025-01-01"
        }
      ]
    }
  ],
  "locs": [
    {
      "id": "loc-0001",
      "name": "Main Bakery",
      "address": "123 Main St",
      "laborBudget": {
        "weekly": 5000.00,
        "effectiveDate": "2025-01-01"
      }
    }
  ],
  "scheds": [
    {
      "id": "sched-000007",
      "date": "2026-03-01",
      "actualCost": 1250.75,
      "assignments": [
        {
          "empId": "emp-0001",
          "shiftId": "shift-msb001",
          "hoursWorked": 8.0,
          "calculatedCost": 204.00,
          "status": "Completed"
        }
      ]
    }
  ]
}
```

## Phase 6: Schema Refinements & Field Standardization

As The Sweet Spot continues to grow and evolve, some field names need to be
updated to better reflect their purpose and accommodate future flexibility.

### Data Version v6.0: Hourly Rate Field Renaming

"We need to rename the hourlyRate field to maxHourlyRate to better reflect
that this is the maximum rate an employee can earn in this role. This will
help us prepare for future features where we might want to implement
different rates based on experience level or performance."

- Rename `hourlyRate` to `maxHourlyRate` in the employee roles array
- Update all references to use the new field name

#### Example JSON v6.0:

```json {
  "emps": [
    {
      "id": "emp-0001",
      "fullName": "Alice Wonderland",
      "contactPhone": "555-1234",
      "roles": [
        {
          "name": "Baker",
          "maxHourlyRate": 25.50, // Renamed from hourlyRate
          "effectiveDate": "2025-01-01"
        },
        {
          "name": "Cake Decorator",
          "maxHourlyRate": 28.75, // Renamed from hourlyRate
          "effectiveDate": "2025-01-01"
        }
      ]
    }
  ]
  // ... rest of the schema remains unchanged
}
```

### Data Version v7.0: Multi-Currency Support

"With our new Canadian location, we need to track costs in both USD and CAD.
Some of our reports need to show costs in the local currency, while others
need to show everything converted to USD for company-wide analysis. We also
need to handle currency conversion rates that change over time."

- Add `currency` field to `location` objects
- Add `exchangeRates` as a new top-level array to track historical rates
- Modify cost-related fields to include both local and converted amounts
- Add currency conversion tracking to cost calculations

#### Example JSON v7.0:

```json {
  "locs": [
    {
      "id": "loc-0001",
      "name": "Main Bakery",
      "address": "123 Main St",
      "currency": "USD",
      "laborBudget": {
        "weekly": 5000.00,
        "effectiveDate": "2025-01-01"
      }
    },
    {
      "id": "loc-0003",
      "name": "Canadian Bakery",
      "address": "456 Maple Street, Vancouver",
      "currency": "CAD",
      "laborBudget": {
        "weekly": 6500.00,
        "effectiveDate": "2025-01-01"
      }
    }
  ],
  "exrates": [
    {
      "id": "exrate-0001",
      "fromCurrency": "CAD",
      "toCurrency": "USD",
      "rate": 0.75,
      "effectiveDate": "2025-01-01",
      "endDate": "2025-03-31"
    },
    {
      "id": "exrate-0002",
      "fromCurrency": "CAD",
      "toCurrency": "USD",
      "rate": 0.73,
      "effectiveDate": "2025-04-01",
      "endDate": null
    }
  ],
  "scheds": [
    {
      "id": "sched-000008",
      "date": "2026-04-01",
      "locId": "loc-0003",
      "actualCost": {
        "localAmount": 1500.00,
        "localCurrency": "CAD",
        "convertedAmount": 1095.00,
        "convertedCurrency": "USD",
        "exchangeRate": 0.73,
        "exchangeRateDate": "2026-04-01"
      },
      "assignments": [
        {
          "empId": "emp-0005",
          "shiftId": "shift-cab001",
          "hoursWorked": 8.0,
          "calculatedCost": {
            "localAmount": 204.00,
            "localCurrency": "CAD",
            "convertedAmount": 148.92,
            "convertedCurrency": "USD",
            "exchangeRate": 0.73,
            "exchangeRateDate": "2026-04-01"
          },
          "status": "Completed"
        }
      ]
    }
  ]
}
```

This enhancement allows The Sweet Spot to:

- Track costs in local currencies for each location
- Maintain historical exchange rates for accurate reporting
- Convert costs to a standard currency (USD) for company-wide analysis
- Generate reports in either local or converted currencies
- Handle currency fluctuations over time while maintaining historical accuracy

The system can now support future international expansion by
simply adding new locs with their respective currencies and exchange rates.

## Phase 8: Planning Enhancement

Planning just one week at a time isn't cutting it anymore,
and they need better control over the schedule
publication process.

### Data Version v8.0: Schedule Status & Extended Planning

"We need to plan schedules further in advance and have better control
over when schedules are visible to staff. Sometimes we need to make
draft schedules that aren't ready for staff to see, and we need a way
to confirm when shifts are actually worked. Also, we want to plan
schedules for longer periods, not just week by week."

- Add `status` field to each schedule object
- Add `publishedAt` and `confirmedAt` datetimes
- Add `version` tracking for schedule revisions

#### Example JSON v8.0:

```json {
  "scheds": [
    {
      "id": "sched-000009",
      "date": "2025-04-01",
      "version": 2,
      "status": "Published", // "Draft", "Published", "Confirmed"
      "publishedAt": "2025-03-15T14:30:00Z",
      "confirmedAt": null,
      "locId": "loc-0001",
      "actualCost": {
        "localAmount": 1500.00,
        "localCurrency": "USD",
        "convertedAmount": 1500.00,
        "convertedCurrency": "USD",
        "exchangeRate": 1.0,
        "exchangeRateDate": "2025-04-01"
      },
      "assignments": [
        {
          "empId": "emp-0001",
          "shiftId": "shift-msb001",
          "hoursWorked": 8.0,
          "calculatedCost": {
            "localAmount": 204.00,
            "localCurrency": "USD",
            "convertedAmount": 204.00,
            "convertedCurrency": "USD",
            "exchangeRate": 1.0,
            "exchangeRateDate": "2025-04-01"
          },
          "status": "Scheduled",
          "originalEmpId": "emp-0001",
          "changeHistory": [
            {
              "datetime": "2025-03-01T10:00:00Z",
              "action": "Initial Draft",
              "empId": "emp-0001",
              "changedByEmpId": "schedulerBot",
              "version": 1
            },
            {
              "datetime": "2025-03-15T14:30:00Z",
              "action": "Schedule Published",
              "empId": "emp-0001",
              "changedByEmpId": "emp-0001",
              "version": 2
            }
          ]
        }
      ]
    }
  ]
}
```

This enhancement provides several benefits:
- Clear workflow states for schedules (Draft → Published → Confirmed)
- Ability to plan and manage schedules for longer periods (quarters, months)
- Version tracking for schedule revisions
- Audit trail of when schedules are published and confirmed
- Better control over when staff can see their schedules
- Support for planning multiple locs in advance
- Maintains all previous functionality while adding new capabilities

The system can now support more sophisticated scheduling workflows while
maintaining backward compatibility with existing features.

## Phase 9: Status Clarification

The `status` field has confused folks. When an employee requests
an assignment swap or cover, they think they're done as the `status`
has changed from "Scheduled". Let's rationalize this by keeping
the main `status` as "Scheduled", but track the proposed changes
in other ways. Perhaps the change history already tells us the
proposal status?

### Data Version v9.0: Simplified Status Management

"We need to simplify how we track assignment status. Currently, when someone
requests a swap or cover, the status changes from 'Scheduled' to something
like 'SwapRequested', which confuses employees. They think their shift is
no longer scheduled. We should keep the main status as 'Scheduled' and use
the change history to track any pending changes or requests."

- Simplify the `status` field in assignments to only use "Scheduled" or "Completed"
- Add a `pendingChanges` object to track any active requests or proposed changes
- Enhance the `changeHistory` to better reflect the current state of requests

#### Example JSON v9.0:

```json {
  "scheds": [
    {
      "id": "sched-000010",
      "date": "2026-05-01",
      "version": 1,
      "status": "Published",
      "publishedAt": "2026-04-15T14:30:00Z",
      "confirmedAt": null,
      "locId": "loc-0001",
      "assignments": [
        {
          "empId": "emp-0001",
          "shiftId": "shift-msb001",
          "hoursWorked": 8.0,
          "calculatedCost": {
            "localAmount": 204.00,
            "localCurrency": "USD",
            "convertedAmount": 204.00,
            "convertedCurrency": "USD",
            "exchangeRate": 1.0,
            "exchangeRateDate": "2026-05-01"
          },
          "status": "Scheduled", // Simplified status
          "pendingChanges": { // New field to track active requests
            "type": "SwapRequest",
            "requestedByEmpId": "emp-0001",
            "requestedAt": "2026-04-20T10:00:00Z",
            "proposedSwapWithEmpId": "emp-0002",
            "status": "PendingApproval"
          },
          "originalEmpId": "emp-0001",
          "changeHistory": [
            {
              "datetime": "2026-04-15T14:30:00Z",
              "action": "Initial Assignment",
              "empId": "emp-0001",
              "changedByEmpId": "schedulerBot",
              "version": 1
            },
            {
              "datetime": "2026-04-20T10:00:00Z",
              "action": "Swap Request Initiated",
              "empId": "emp-0001",
              "changedByEmpId": "emp-0001",
              "requestDetails": {
                "type": "SwapRequest",
                "proposedSwapWithEmpId": "emp-0002",
                "reason": "Personal appointment"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

This enhancement provides several benefits:
- Clearer status indication for employees (they're still scheduled until changes are approved)
- Better tracking of pending changes through a dedicated object
- Maintained history of all changes and requests
- Simplified status values that are easier to understand
- Clear separation between the current state and proposed changes
- Support for multiple types of pending changes (swaps, covers, etc.)
- Better visibility into the approval process

The system now provides a more intuitive way to handle assignment changes
while maintaining a clear record of the current state and any pending modifications.
