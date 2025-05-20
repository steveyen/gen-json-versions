# The Sweet Spot: Evolving a Bakery Employee Scheduling App

Let's simulate a scenario where a small bakery, "The Sweet Spot",
gradually expands its operations. As their business grows, so do the
needs for team scheduling, where they've started tracking their
team scheduling data as JSON records.

We'll be working with JSON data schemas throughout this project
and its evolution through multiple versions and feature enhancements
that were requested by the bakery.

## Phase 1: The Bare Bones Schedule

### Feature Ask 1.0: The Start

"As the bakery owner, I need a simple way to create
a weekly schedule that lists which employee is working on which day
and their assigned shift (e.g., Morning Bake, Afternoon Cashier, etc)."

### Initial JSON Data Schema (Version 1.0)

To start, we'll have multiple JSON objects, one JSON document per
daily schedule. Each schedule object will specify the `date`
and an array of `assignments`. Each `assignment` will
link an `employeeName` to a `shift`.

```json
{
  "sched": [
    {
      "id": "sched-000001",
      "date": "2025-05-19",
      "assignments": [
        {
          "employeeName": "Alice Wonderland",
          "shift": "Morning Bake (6 AM - 2 PM)"
        },
        {
          "employeeName": "Bob The Baker",
          "shift": "Afternoon Cashier (12 PM - 8 PM)"
        }
      ]
    },
    {
      "id": "sched-000002",
      "date": "2025-05-20",
      "assignments": [
        {
          "employeeName": "Alice Wonderland",
          "shift": "Morning Bake (6 AM - 2 PM)"
        },
        {
          "employeeName": "Charlie Chocolatier",
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

### Feature Ask 2.1: Centralized Employee Roster

"We have more staff now, and just typing names is
leading to inconsistencies. I need a separate place to
manage employee details like their full name and a
unique employee ID. When scheduling, I want to refer to
these employees by their ID."

### JSON Data Schema Changes (Version 1.1)

- Introduce employee JSON records.

Each employee will have an `empId` (a unique identifier,
perhaps a number or a short string like "emp-0001")
and a `fullName`.

- From now on, a schedule will refer to `empId`
  instead of `employeeName`.

#### Example Snippet (Illustrating Changes):

```json {
  "emp": [
    {
      "id": "emp-0001",
      "fullName": "Alice Wonderland",
      "contactNumber": "555-1234" // Added for more complete employee info
    }, {
      "id": "emp-0002",
      "fullName": "Bob The Baker",
      "contactNumber": "555-5678"
    }, {
      "id": "emp-0003",
      "fullName": "Charlie Chocolatier",
      "contactNumber": "555-8765"
    }
  ],
  "sched": [
    {
      "id": "sched-000003",
      "date": "2025-07-21",
      "assignments": [
        {
          "empId": "emp-0001", // Changed from employeeName
          "shift": "Morning Bake (6 AM - 2 PM)"
        }, {
          "empId": "emp-0002",
          "shift": "Afternoon Cashier (12 PM - 8 PM)"
        }
      ]
    } // ...
  ]
} ```

### Feature Ask 2.2: Standardized Shift Definitions

"Typing out shift details like 'Morning Bake (6 AM - 2 PM)' every time is
tedious and error-prone. We need to define standard shifts (e.g., 'Morning
Baker', 'Afternoon Cashier', 'Evening Prep') with set start and end times,
and then assign employees to these predefined shifts."

### JSON Data Schema Changes (Version 1.2)

- Introduce another new top-level array called `definedShifts`.

Each object in this array will have a `id` (unique identifier,
e.g., "shift-ms001"), a `name` (e.g., "Morning Baker"),
`startTime` (e.g., "06:00"), and `endTime` (e.g., "14:00").

- In the `assignments` of a daily `schedule`, instead of a
free-text `shift` description, we'll now use `shiftId` to
link to the new `definedShifts` array.

#### Example Snippet (Illustrating Changes):

```json {
  "emp": [
    // ... (as in v1.1)
  ],
  "definedShifts": [
    {
      "id": "shift-ms001",
      "name": "Morning Baker",
      "startTime": "06:00",
      "endTime": "14:00",
      "description": "Primary baking shift for breads and morning pastries."
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
  "sched": [
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
} ```

## Phase 3: Specialization and Availability

The Sweet Spot is now a bustling local favorite! They have specialized
roles and staff have different availability constraints.

### Feature Ask 3.1: Employee Roles & Shift Suitability

"Some of my staff are trained as bakers, others mainly for counter service, and
some are good at cake decorating. I need to track employee roles. Also, not
every shift is suitable for every role (e.g., a cashier can't cover a 'Master
Baker' shift). It would be great if, when assigning shifts, we could see which
roles are suitable for that shift."

### JSON Data Schema Changes (Version 1.3)

- Add a `roles` array to each object in the `employees` array (e.g., `roles:
["Baker", "Cashier"]`). An employee can have multiple roles.  - Add an
`eligibleRoles` array to each object in the `definedShifts` array (e.g.,
`eligibleRoles: ["Baker", "Lead Baker"]`). This indicates which roles can be
assigned to this shift.

#### Example Snippet (Illustrating Changes):

```json {
  "emp": [
    {
      "id": "emp-0001",
      "fullName": "Alice Wonderland",
      "contactNumber": "555-1234",
      "roles": ["Baker", "Cake Decorator"] // New field
    }, {
      "id": "emp-0002",
      "fullName": "Bob The Baker",
      "contactNumber": "555-5678",
      "roles": ["Baker"] // New field
    }, {
      "id": "emp-0004", // New employee
      "fullName": "Diana Dishwasher",
      "contactNumber": "555-1122",
      "roles": ["Cashier", "Utility"] // New field
    }
  ],
  "definedShifts": [
    {
      "id": "shift-ms001",
      "name": "Morning Baker",
      "startTime": "06:00",
      "endTime": "14:00",
      "description": "Primary baking shift for breads and morning pastries.", "eligibleRoles": ["Baker", "Lead Baker"] // New field
    }, {
      "id": "shift-ac001",
      "name": "Afternoon Cashier",
      "startTime": "12:00",
      "endTime": "20:00",
      "description": "Customer service and sales at the counter.", "eligibleRoles": ["Cashier"] // New field
    } // ...
  ],
  "sched": [
    // ... (structure remains the same, but assignments now implicitly link to
    employees with roles and shifts with eligible roles)
  ]
} ```

### Feature Ask 3.2: Employee Unavailability & Time Off Requests

"Staff need to be able to request time off, and I need to mark their
unavailability (e.g., student only works evenings, someone has a recurring
Tuesday morning appointment). The system should prevent me from accidentally
scheduling someone when they are unavailable."

### JSON Data Schema Changes (Version 1.4)

- Add an `unavailability` array to each `employee` object.
Each item in this array is an object specifying `startDate`,
`endDate`, `startTime` (optional), `endTime` (optional),
`reason` (e.g., "Vacation," "Doctor's Appointment," "Recurring Class"),
and `status` (e.g., "Requested", "Approved", "Denied").

#### Example Snippet (Illustrating Changes):

```json {
  "emp": [
    {
      "id": "emp-0001",
      "fullName": "Alice Wonderland",
      "contactNumber": "555-1234",
      "roles": ["Baker", "Cake Decorator"],
      "unavailability": [ // New field
        {
          "requestId": "to001", // Optional: to track individual requests
          "type": "Time Off", // "Time Off", "Recurring Unavailability"
          "startDate": "2025-10-20",
          "endDate": "2025-10-22",
          "reason": "Vacation",
          "status": "Approved" // "Requested", "Approved", "Denied"
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
    // ... (as in v1.3)
  ],
  "sched": [
    // ... (structure remains the same,
    //      but scheduling logic now needs to check unavailability)
  ]
} ```

## Phase 4: Workflow Enhancements & Reporting

The Sweet Spot is thriving and opening a second, smaller
kiosk location! They need more robust scheduling features.

### Feature Ask 4.1: Multiple Locations

"We're opening a kiosk at the farmer's market! I need to create schedules for
different locations ('Main Bakery', 'Market Kiosk') and assign staff to shifts
at specific locations."

### JSON Data Schema Changes (Version 1.5)

- We'll introduce a new top-level array `locations`. Each location
will have `locationId` (e.g., "loc01") and
a `locationName` (e.g., "Main Bakery").

- Add `locationId` to each `definedShift` object. This means a
shift definition is now tied to a location (e.g., "Morning Baker
at Main Bakery" is different from "Morning Kiosk Seller at Market Kiosk").

#### Example Snippet (Illustrating Changes):

```json {
  "emp": [
    // ... (as in v1.4)
  ],
  "loc": [ // New top-level entity
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
      "locationId": "loc-0001", // New field
      "name": "Morning Baker - Main",
      "startTime": "06:00",
      "endTime": "14:00",
      "description": "Primary baking shift for breads and morning pastries at the main bakery.",
      "eligibleRoles": ["Baker", "Lead Baker"]
    }, {
      "id": "shift-mkm001", // More specific ID
      "locationId": "loc-0002", // New field
      "name": "Morning Kiosk Seller",
      "startTime": "08:00",
      "endTime": "13:00",
      "description": "Selling pastries and coffee at the market kiosk.",
      "eligibleRoles": ["Cashier", "Barista"]
    } // ...
  ],
  "sched": [
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
} ```

### Feature Ask 4.2: Shift Swapping/Cover Requests & Audit Trail

"Staff often want to swap shifts or request someone to cover
their shift. I need a formal way to manage these requests,
get approvals, and see a history of who originally was
scheduled versus who actually worked it (an audit trail
for the assignment)."

### JSON Data Schema Changes (Version 1.6)

- We'll modify the `assignment` object within a daily `schedule`.
  - Add an `originalEmpId` (if different from the current `employeeId`
    due to a swap/cover).
  - Add an `status` (e.g., "Scheduled",
    "SwapRequested", "CoverRequested", "SwapApproved", "CoverApproved").
  - Add a `changeHistory` array. Each item in this array could be
    an object with `timestamp`, `changedByEmpId` (who initiated/approved),
    `previousEmpId`, `newEmpId`, `action` (e.g., "Swap Request",
    "Cover Approved by Manager"), and `notes`.

#### Example Snippet (Illustrating Changes):

```json {
  // ... emp, loc, definedShifts as in v1.5

  "sched": [
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
              "timestamp": "2026-01-28T10:00:00Z",
              "action": "Initial Assignment",
              "empId": "emp-0001", // Employee assigned
              "changedByEmpId": "schedulerBot" // Or manager's ID
            }, {
              "timestamp": "2026-01-30T14:30:00Z",
              "action": "Cover Requested",
              "requestingEmpId": "emp-0001",
              "notes": "Feeling unwell."
            }, {
              "timestamp": "2026-01-30T17:00:00Z",
              "action": "Cover Offered",
              "offeringEmpId": "emp-0002"
            }, {
              "timestamp": "2026-01-31T09:00:00Z",
              "action": "Cover Approved by Manager",
              "approvingManagerId": "emp-0001", // Assuming a manager role/ID
              "previousEmpId": "emp-0001",
              "newEmpId": "emp-0002"
            }
	        ]
	      } // ... more assignments
    }
	]
} ```

## Phase 5: Advanced Business Operations & Analytics

The Sweet Spot has grown into a successful multi-location
business and needs more sophisticated features to manage
operations and analyze performance.

### Feature Ask 5.1: Labor Cost Tracking & Budget Management

"As we've grown, I need to track labor costs more precisely.
Each role should have an associated hourly rate, and I want to
be able to set weekly labor budgets per location. The system
should warn me if a schedule exceeds the budget."

### JSON Data Schema Changes (Version 1.7)

- Add `hourlyRate` to each `role` in the `roles` array
- Add `laborBudget` to each `location` object
- Add `actualCost` to each `schedule` object
- Modify `assignment` to include `hoursWorked` and `calculatedCost`

#### Example Snippet (Illustrating Changes):

```json {
  "emp": [
    {
      "id": "emp-0001",
      "fullName": "Alice Wonderland",
      "contactNumber": "555-1234",
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
  "loc": [
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
  "sched": [
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
