# The Sweet Spot: Evolving a Bakery Scheduling App

Okay, students, welcome to your next homework assignment! This project will
simulate a real-world scenario where a small bakery, "The Sweet Spot," gradually
expands its operations. As their business grows, so do the needs of their team
scheduling application. Your task will be to adapt the application's data schema
to accommodate these new requirements.

We'll be working with JSON data schemas throughout this project. Pay close
attention to how each feature request impacts the existing schema and how you
can evolve it gracefully.

## Phase 1: The Bare Bones Schedule

### Feature Ask As the bakery owner, I need a simple way to create a weekly
schedule that lists which employee is working on which day and their assigned
shift (e.g., "Morning Bake," "Afternoon Counter").

### Initial JSON Data Schema (Version 1.0)

Let's start with a root JSON object that represents the entire schedule. This
object will contain an array of `weeks`. Each `week` object will have a
`weekStartDate` and an array of `dailySchedules`. Each `dailySchedule` object
will specify the `date` and an array of `assignments`. Each `assignment` will
link an `employeeName` to a `shift`.

```json {
  "schedules": [
    {
      "weekStartDate": "2025-05-19", // ISO 8601 Format YYYY-MM-DD
      "dailySchedules": [
	{
	  "date": "2025-05-19", "assignments": [
	    {
	      "employeeName": "Alice Wonderland", "shift": "Morning Bake (6 AM -
	      2 PM)"
	    }, {
	      "employeeName": "Bob The Baker", "shift": "Afternoon Counter (12
	      PM - 8 PM)"
	    }
	  ]
	}, {
	  "date": "2025-05-20", "assignments": [
	    {
	      "employeeName": "Alice Wonderland", "shift": "Morning Bake (6 AM -
	      2 PM)"
	    }, {
	      "employeeName": "Charlie Chocolatier", "shift": "Afternoon Counter
	      (12 PM - 8 PM)"
	    }
	  ]
	} // ... more days
      ]
    } // ... more weeks
  ]
} ```

## Phase 2: Growing Pains & Staff Management

A few months later, The Sweet Spot is doing well! They've hired more staff and
need better ways to manage employee information and define shifts more formally.

### Feature Ask 2.1: Centralized Employee Roster

"We have more staff now, and just typing names is leading to inconsistencies. I
need a separate place to manage employee details like their full name and a
unique employee ID. When scheduling, I want to refer to these employees by their
ID."

### JSON Data Schema Changes (Version 1.1)

- Introduce a new top-level array called `employees`. Each object in this array
will represent an employee and have `employeeId` (a unique identifier, perhaps a
number or a short string like "emp001") and `fullName`.  - Modify the
`assignments` in `dailySchedules`. Instead of `employeeName`, use `employeeId`
to link to the new `employees` array.

*Self-Correction during thought process: Initially, I just thought of adding
employeeId. However, to make it more realistic for lookups and to keep employee
information distinct from the schedule, a separate top-level `employees` array
is better.*

#### Example Snippet (Illustrating Changes):

```json {
  "employees": [
    {
      "employeeId": "emp001", "fullName": "Alice Wonderland", "contactNumber":
      "555-1234" // Added as part of Feature 2.1 for more complete employee info
    }, {
      "employeeId": "emp002", "fullName": "Bob The Baker", "contactNumber":
      "555-5678"
    }, {
      "employeeId": "emp003", "fullName": "Charlie Chocolatier",
      "contactNumber": "555-8765"
    }
  ], "schedules": [
    {
      "weekStartDate": "2025-07-21", "dailySchedules": [
	{
	  "date": "2025-07-21", "assignments": [
	    {
	      "employeeId": "emp001", // Changed from employeeName "shift":
	      "Morning Bake (6 AM - 2 PM)"
	    }, {
	      "employeeId": "emp002", "shift": "Afternoon Counter (12 PM - 8
	      PM)"
	    }
	  ]
	} // ...
      ]
    } // ...
  ]
} ```

### Feature Ask 2.2: Standardized Shift Definitions

"Typing out shift details like 'Morning Bake (6 AM - 2 PM)' every time is
tedious and error-prone. We need to define standard shifts (e.g., 'Morning
Baker', 'Afternoon Cashier', 'Evening Prep') with set start and end times, and
then assign employees to these predefined shifts."

### JSON Data Schema Changes (Version 1.2)

- Introduce another new top-level array called `definedShifts`. Each object in
this array will have a `shiftId` (unique identifier, e.g., "shift01"), a
`shiftName` (e.g., "Morning Baker"), `startTime` (e.g., "06:00"), and `endTime`
(e.g., "14:00").  - Modify the `assignments` in `dailySchedules`. Instead of a
free-text `shift` description, use `shiftId` to link to the new `definedShifts`
array.

#### Example Snippet (Illustrating Changes):

```json {
  "employees": [
    // ... (as in v1.1)
  ], "definedShifts": [
    {
      "shiftId": "ms001", "shiftName": "Morning Baker", "startTime": "06:00",
      "endTime": "14:00", "description": "Primary baking shift for breads and
      morning pastries."
    }, {
      "shiftId": "ac001", "shiftName": "Afternoon Cashier", "startTime":
      "12:00", "endTime": "20:00", "description": "Customer service and sales at
      the counter."
    }, {
      "shiftId": "ep001", "shiftName": "Evening Prep", "startTime": "16:00",
      "endTime": "22:00", "description": "Preparing ingredients and doughs for
      the next day."
    }
  ], "schedules": [
    {
      "weekStartDate": "2025-09-15", "dailySchedules": [
	{
	  "date": "2025-09-15", "assignments": [
	    {
	      "employeeId": "emp001", "shiftId": "ms001" // Changed from
	      free-text shift
	    }, {
	      "employeeId": "emp002", "shiftId": "ac001"
	    }
	  ]
	} // ...
      ]
    } // ...
  ]
} ```

## Phase 3: Specialization and Availability

The Sweet Spot is now a bustling local favorite! They have specialized roles and
staff have different availability constraints.

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
  "employees": [
    {
      "employeeId": "emp001", "fullName": "Alice Wonderland", "contactNumber":
      "555-1234", "roles": ["Baker", "Cake Decorator"] // New field
    }, {
      "employeeId": "emp002", "fullName": "Bob The Baker", "contactNumber":
      "555-5678", "roles": ["Baker"] // New field
    }, {
      "employeeId": "emp004", // New employee "fullName": "Diana Dishwasher",
      "contactNumber": "555-1122", "roles": ["Cashier", "Utility"] // New field
    }
  ], "definedShifts": [
    {
      "shiftId": "ms001", "shiftName": "Morning Baker", "startTime": "06:00",
      "endTime": "14:00", "description": "Primary baking shift for breads and
      morning pastries.", "eligibleRoles": ["Baker", "Lead Baker"] // New field
    }, {
      "shiftId": "ac001", "shiftName": "Afternoon Cashier", "startTime":
      "12:00", "endTime": "20:00", "description": "Customer service and sales at
      the counter.", "eligibleRoles": ["Cashier"] // New field
    } // ...
  ], "schedules": [
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

- Add an `unavailability` array to each `employee` object. Each item in this
array could be an object specifying `startDate`, `endDate`, `startTime`
(optional), `endTime` (optional), `reason` (e.g., "Vacation," "Doctor's
Appointment," "Recurring Class"), and `status` (e.g., "Requested", "Approved",
"Denied").  - Alternatively, or additionally, you could create a new top-level
`timeOffRequests` array if requests need more complex workflow and tracking. For
this iteration, let's embed it within the employee for simplicity in
demonstrating schema change directly on the employee record.

#### Example Snippet (Illustrating Changes):

```json {
  "employees": [
    {
      "employeeId": "emp001", "fullName": "Alice Wonderland", "contactNumber":
      "555-1234", "roles": ["Baker", "Cake Decorator"], "unavailability": [ //
      New field
	{
	  "requestId": "to001", // Optional: if you want to track individual
	  requests "type": "Time Off", // "Time Off", "Recurring Unavailability"
	  "startDate": "2025-10-20", "endDate": "2025-10-22", "reason":
	  "Vacation", "status": "Approved" // "Requested", "Approved", "Denied"
	}, {
	  "requestId": "ru001", "type": "Recurring Unavailability", "dayOfWeek":
	  "Tuesday", // For recurring "startTime": "09:00", "endTime": "12:00",
	  "reason": "Class", "status": "Approved"
	}
      ]
    } // ...
  ], "definedShifts": [
    // ... (as in v1.3)
  ], "schedules": [
    // ... (structure remains the same, but scheduling logic now needs to check
    unavailability)
  ]
} ```

## Phase 4: Workflow Enhancements & Reporting

The Sweet Spot is thriving and opening a second, smaller kiosk location! They
need more robust scheduling features.

### Feature Ask 4.1: Multiple Locations

"We're opening a kiosk at the farmer's market! I need to create schedules for
different locations ('Main Bakery', 'Market Kiosk') and assign staff to shifts
at specific locations."

### JSON Data Schema Changes (Version 1.5)

- Introduce a new top-level array `locations`. Each object will have
`locationId` (e.g., "loc01") and `locationName` (e.g., "Main Bakery").  - Add
`locationId` to each `definedShift` object. This means a shift definition is now
tied to a location (e.g., "Morning Baker at Main Bakery" is different from
"Morning Kiosk Seller at Market Kiosk").
    - *Self-correction: Alternatively, `locationId` could be added to the
    `assignment` object within the schedule. This would allow a generic shift
    (like "Cashier") to be assigned at different locations. Let's go with adding
    `locationId` to the assignment for more flexibility, as a "Cashier" shift
    might exist at both locations but with different employees.*
- Therefore, add `locationId` to each `assignment` object within
`dailySchedules`.  - Modify `definedShifts`: it might be better to keep
`definedShifts` generic (e.g. "Baker shift", "Cashier shift") and then when an
*instance* of that shift is scheduled, it gets a location. Or, if shifts are
truly different per location (e.g. different hours, different roles needed),
then `locationId` in `definedShifts` makes sense. Let's assume for now that the
*nature* of the shift (its tasks and eligible roles) can be location-specific.
So, `locationId` in `definedShifts` is appropriate. This might mean some shifts
are duplicated if they are identical but at different locations, or you might
create very specific shifts like "Main Bakery - Morning Bake". Let's stick to
`locationId` in `definedShifts` for this iteration to explore that path.

#### Example Snippet (Illustrating Changes):

```json {
  "employees": [
    // ... (as in v1.4)
  ], "locations": [ // New top-level entity
    {
      "locationId": "loc001", "locationName": "Main Bakery", "address": "123
      Main St"
    }, {
      "locationId": "loc002", "locationName": "Farmer's Market Kiosk",
      "address": "Green Park, Stall 15"
    }
  ], "definedShifts": [
    {
      "shiftId": "msb001", // More specific ID "locationId": "loc001", // New
      field "shiftName": "Morning Baker - Main", "startTime": "06:00",
      "endTime": "14:00", "description": "Primary baking shift for breads and
      morning pastries at the main bakery.", "eligibleRoles": ["Baker", "Lead
      Baker"]
    }, {
      "shiftId": "mkm001", // More specific ID "locationId": "loc002", // New
      field "shiftName": "Morning Kiosk Seller", "startTime": "08:00",
      "endTime": "13:00", "description": "Selling pastries and coffee at the
      market kiosk.", "eligibleRoles": ["Cashier", "Barista"]
    } // ...
  ], "schedules": [
    {
      "weekStartDate": "2025-12-01", // Potentially, you might want to group
      dailySchedules by location within a week, // or have a locationId at the
      'week' or 'dailySchedule' level if a schedule is for one location.  // For
      now, assignments link to shifts which are location-specific.
      "dailySchedules": [
	{
	  "date": "2025-12-01", "assignments": [
	    {
	      "employeeId": "emp001", "shiftId": "msb001" // This shift
	      inherently knows its location
	    }, {
	      "employeeId": "emp004", "shiftId": "mkm001" // This shift is for
	      the kiosk
	    }
	  ]
	} // ...
      ]
    } // ...
  ]
} ```

### Feature Ask 4.2: Shift Swapping/Cover Requests & Audit Trail

"Staff often want to swap shifts or request someone to cover their shift. I need
a formal way to manage these requests, get approvals, and see a history of who
originally was scheduled versus who actually worked it (an audit trail for the
assignment)."

### JSON Data Schema Changes (Version 1.6)

- Modify the `assignment` object within `dailySchedules`.
    - Add an `originalEmployeeId` (if different from the current `employeeId`
    due to a swap/cover).  - Add an `assignmentStatus` (e.g., "Scheduled",
    "SwapRequested", "CoverRequested", "SwapApproved", "CoverApproved").  - Add
    a `changeHistory` array. Each item in this array could be an object with
    `timestamp`, `changedByEmployeeId` (who initiated/approved),
    `previousEmployeeId`, `newEmployeeId`, `action` (e.g., "Swap Request",
    "Cover Approved by Manager"), and `notes`.
- (Optional: A separate top-level `shiftChangeRequests` collection could be
created for more detailed tracking if the embedded `changeHistory` becomes too
cumbersome). For this exercise, let's enhance the `assignment` object.

#### Example Snippet (Illustrating Changes):

```json {
  // ... employees, locations, definedShifts as in v1.5

  "schedules": [
    {
      "weekStartDate": "2026-02-02", "dailySchedules": [
	{
	  "date": "2026-02-02", "assignments": [
	    {
	      "assignmentId": "asgn001", // Adding an ID to the assignment
	      itself for easier reference "employeeId": "emp002", // Currently
	      assigned employee "originalEmployeeId": "emp001", // Who was
	      originally scheduled "shiftId": "msb001", "assignmentStatus":
	      "CoverApproved", // New field "changeHistory": [ // New field
		{
		  "timestamp": "2026-01-28T10:00:00Z", "action": "Initial
		  Assignment", "employeeId": "emp001", // Employee assigned
		  "changedBy": "schedulerBot" // Or manager's ID
		}, {
		  "timestamp": "2026-01-30T14:30:00Z", "action": "Cover
		  Requested", "requestingEmployeeId": "emp001", "notes":
		  "Feeling unwell."
		}, {
		  "timestamp": "2026-01-30T17:00:00Z", "action": "Cover
		  Offered", "offeringEmployeeId": "emp002"
		}, {
		  "timestamp": "2026-01-31T09:00:00Z", "action": "Cover Approved
		  by Manager", "approvingManagerId": "mgr001", // Assuming a
		  manager role/ID "previousEmployeeId": "emp001",
		  "newEmployeeId": "emp002"
		}
	      ]
	    } // ... more assignments
	  ]
	} // ... more days
      ]
    } // ... more weeks
  ]
} ```

## Your Tasks for this Homework

1. **Understand the Evolution:** For each Phase (1 through 4), carefully review
the feature asks and the corresponding JSON data schema changes.

2. **Identify Migration Challenges (Conceptual):** For each transition (e.g.,
from v1.0 to v1.1, then v1.1 to v1.2, etc.), briefly describe:
    - What are the main challenges in migrating existing data from the OLD
    schema to the NEW schema?  - Will any new fields require default values?  -
    Are there any fields being removed or restructured where data might be lost
    if not handled carefully?  - How would you ensure data integrity during the
    migration? (e.g., if `employeeName` is replaced by `employeeId`, how do you
    map existing names to new IDs?)

3. **Write Migration Logic (Pseudocode/High-Level Steps):** For TWO of the
schema transitions of your choice (e.g., v1.1 to v1.2 AND v1.3 to v1.4), write
down the high-level steps or pseudocode for a script that would migrate data
from the old schema version to the new one.

    *Example for v1.0 to v1.1 (if you were to choose this one):* - Create a new
    empty `employees` array.  - Iterate through all `schedules`,
    `dailySchedules`, and `assignments` in the v1.0 data.  - For each unique
    `employeeName` found:
	- Generate a new unique `employeeId`.  - Add an object `{ "employeeId":
	newId, "fullName": employeeName, "contactNumber": null }` to the
	`employees` array.  - Store a mapping of `employeeName` to `newId`.
    - Create the new v1.1 schedule structure.  - Iterate through the old
    `schedules` data again.  - For each `assignment`, replace `employeeName`
    with its corresponding `employeeId` from the mapping.  - Populate the new
    `schedules` array with the transformed data.  - The final output contains
    the new `employees` array and the transformed `schedules` array.

