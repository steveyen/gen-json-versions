# The Knead for Growth - Evolving a Bakery's Scheduling App

## Project Overview

Students will start with a very basic JSON data structure representing a simple
employee schedule for "The Sweet Spot," a small local bakery. As the bakery
grows and its operational needs become more complex, new features will be
requested. Students will need to design and document the necessary changes to
the JSON data schema for each new feature. The focus is on understanding how
data structures must adapt and the implications of these changes (though actual
data migration script writing can be an optional extension).

## Initial State: The Bare Minimum Schedule (Version 0.1)

"The Sweet Spot" bakery has just opened. They have a few employees and need a
very simple way to see who is working on what day.

### Feature Ask 0.1: - Display a weekly schedule showing which employees are
working on which days.  - For now, a simple designation of "Morning Shift" or
"Afternoon Shift" is sufficient for each day an employee works.

### Initial JSON Data Schema (`schedule_v0.1.json`):

```json {
  "version": "0.1", "bakeryName": "The Sweet Spot", "employees": [
    {
      "employeeId": "emp101", "name": "Alice Wonderland", "shifts": [
	{ "dayOfWeek": "Monday", "shiftType": "Morning" }, { "dayOfWeek":
	"Wednesday", "shiftType": "Afternoon" }, { "dayOfWeek": "Friday",
	"shiftType": "Morning" }
      ]
    }, {
      "employeeId": "emp102", "name": "Bob The Baker", "shifts": [
	{ "dayOfWeek": "Tuesday", "shiftType": "Morning" }, { "dayOfWeek":
	"Thursday", "shiftType": "Morning" }, { "dayOfWeek": "Saturday",
	"shiftType": "Morning" }
      ]
    }
  ]
} ```

## Phase 1: More Specific Timings (Version 0.2)

Business is picking up! Just saying "Morning" or "Afternoon" isn't enough. They
need precise start and end times for shifts.

### Feature Ask 0.2: - For each assigned shift, specify the exact start time and
end time (e.g., "08:00" to "16:00").  - The `dayOfWeek` is still important.

### JSON Data Schema Changes (`schedule_v0.2.json`): - The `shifts` array for
each employee will now contain objects with `dayOfWeek`, `startTime`, and
`endTime`.  - The `shiftType` field is removed as it's superseded by specific
times.

```json {
  "version": "0.2", "bakeryName": "The Sweet Spot", "employees": [
    {
      "employeeId": "emp101", "name": "Alice Wonderland", "shifts": [
	{ "dayOfWeek": "Monday", "startTime": "07:00", "endTime": "15:00" }, {
	"dayOfWeek": "Wednesday", "startTime": "12:00", "endTime": "20:00" }, {
	"dayOfWeek": "Friday", "startTime": "07:00", "endTime": "15:00" }
      ]
    }, {
      "employeeId": "emp102", "name": "Bob The Baker", "shifts": [
	{ "dayOfWeek": "Tuesday", "startTime": "06:00", "endTime": "14:00" }, {
	"dayOfWeek": "Thursday", "startTime": "06:00", "endTime": "14:00" }, {
	"dayOfWeek": "Saturday", "startTime": "08:00", "endTime": "16:00" }
      ]
    }, {
      "employeeId": "emp103", "name": "Charlie Croissant", "shifts": [
	{ "dayOfWeek": "Monday", "startTime": "12:00", "endTime": "20:00" }, {
	"dayOfWeek": "Friday", "startTime": "12:00", "endTime": "20:00" }
      ]
    }
  ]
} ```

**Discussion Point:** How would you handle migrating data from v0.1 to v0.2?
(e.g., assume "Morning" was 07:00-15:00 and "Afternoon" was 12:00-20:00 as a
default during migration).

## Phase 2: Roles and Responsibilities (Version 0.3)

The bakery is hiring more specialized staff: bakers, counter staff, cake
decorators. They need to assign roles to shifts.

### Feature Ask 0.3: - Each shift needs an assigned `role` (e.g., "Baker",
"Counter Staff", "Decorator").  - Employees might have a primary role, but they
could be assigned to different roles for different shifts based on need.

### JSON Data Schema Changes (`schedule_v0.3.json`): - A `role` field is added
to each object within the `shifts` array.  - (Optional) Add a `primaryRole`
field to the employee object for reference.

```json {
  "version": "0.3", "bakeryName": "The Sweet Spot", "employees": [
    {
      "employeeId": "emp101", "name": "Alice Wonderland", "primaryRole":
      "Counter Staff", "shifts": [
	{ "dayOfWeek": "Monday", "startTime": "07:00", "endTime": "15:00",
	"role": "Counter Staff" }, { "dayOfWeek": "Wednesday", "startTime":
	"12:00", "endTime": "20:00", "role": "Counter Staff" }, { "dayOfWeek":
	"Friday", "startTime": "07:00", "endTime": "15:00", "role": "Decorator"
	}
      ]
    }, {
      "employeeId": "emp102", "name": "Bob The Baker", "primaryRole": "Baker",
      "shifts": [
	{ "dayOfWeek": "Tuesday", "startTime": "06:00", "endTime": "14:00",
	"role": "Baker" }, { "dayOfWeek": "Thursday", "startTime": "06:00",
	"endTime": "14:00", "role": "Baker" }, { "dayOfWeek": "Saturday",
	"startTime": "08:00", "endTime": "16:00", "role": "Baker" }
      ]
    }, {
      "employeeId": "emp103", "name": "Charlie Croissant", "primaryRole":
      "Baker", "shifts": [
	{ "dayOfWeek": "Monday", "startTime": "12:00", "endTime": "20:00",
	"role": "Baker" }, { "dayOfWeek": "Friday", "startTime": "12:00",
	"endTime": "20:00", "role": "Counter Staff" }
      ]
    }
  ]
} ```

## Phase 3: Managing Multiple Weeks and Shift Status (Version 0.4)

Planning just one week at a time isn't cutting it. They need to plan for
multiple weeks and also track if a shift is confirmed or just a draft.

### Feature Ask 0.4: - The schedule should now be by specific dates, not just
`dayOfWeek`.  - Allow schedules to be planned for several weeks in advance.  -
Each shift needs a `status` (e.g., "Draft", "Published",
"Confirmed_By_Employee").

### JSON Data Schema Changes (`schedule_v0.4.json`): - The top-level structure
might change. Instead of `employees` being the root array, we might have a
`schedulePeriods` array, each period having a `startDate`, `endDate`, and then
the employee shifts within that period.  - Alternatively, to keep `employees`
central, their `shifts` will now have a specific `date` (YYYY-MM-DD) instead of
`dayOfWeek`.  - A `status` field is added to each shift object.

Let's go with modifying the `shifts` within `employees` for now for simpler
progression:

```json {
  "version": "0.4", "bakeryName": "The Sweet Spot", "defaultWeekStartDate":
  "2025-05-19", // For context if needed by UI "employees": [
    {
      "employeeId": "emp101", "name": "Alice Wonderland", "primaryRole":
      "Counter Staff", "shifts": [
	{
	  "date": "2025-05-19", "startTime": "07:00", "endTime": "15:00",
	  "role": "Counter Staff", "status": "Published"
	}, {
	  "date": "2025-05-21", "startTime": "12:00", "endTime": "20:00",
	  "role": "Counter Staff", "status": "Published"
	}, {
	  "date": "2025-05-23", "startTime": "07:00", "endTime": "15:00",
	  "role": "Decorator", "status": "Confirmed_By_Employee"
	}, {
	  "date": "2025-05-26", "startTime": "07:00", "endTime": "15:00",
	  "role": "Counter Staff", "status": "Draft"
	}
      ]
    }, {
      "employeeId": "emp102", "name": "Bob The Baker", "primaryRole": "Baker",
      "shifts": [
	{
	  "date": "2025-05-20", "startTime": "06:00", "endTime": "14:00",
	  "role": "Baker", "status": "Published"
	}, {
	  "date": "2025-05-22", "startTime": "06:00", "endTime": "14:00",
	  "role": "Baker", "status": "Confirmed_By_Employee"
	}
      ]
    }
  ]
} ```

**Discussion Point:** What are the pros and cons of keeping shifts nested under
employees vs. having a separate top-level `shifts` collection that references
employee IDs?

## Phase 4: Employee Unavailability and Shift Notes (Version 0.5)

Employees need to be able to request time off or mark unavailability. Managers
also want to add notes to specific shifts (e.g., "Expecting large catering
order").

### Feature Ask 0.5: - Allow employees to submit unavailability requests for
specific dates or date ranges.  - Allow managers to add free-text notes to
individual shifts.

### JSON Data Schema Changes (`schedule_v0.5.json`): - Add an `unavailability`
array to each employee object. Each item in this array could be an object with
`startDate`, `endDate`, `reason` (optional), and `status` (e.g., "Requested",
"Approved", "Denied").  - Add a `notes` field (string) to each shift object.

```json {
  "version": "0.5", "bakeryName": "The Sweet Spot", "employees": [
    {
      "employeeId": "emp101", "name": "Alice Wonderland", "primaryRole":
      "Counter Staff", "unavailability": [
	{
	  "startDate": "2025-06-10", "endDate": "2025-06-12", "reason":
	  "Vacation", "status": "Approved"
	}, {
	  "date": "2025-07-01", "reason": "Doctor's Appointment", "status":
	  "Requested"
	}
      ], "shifts": [
	{
	  "date": "2025-05-19", "startTime": "07:00", "endTime": "15:00",
	  "role": "Counter Staff", "status": "Published", "notes": "Morning rush
	  expected."
	}, {
	  "date": "2025-05-21", "startTime": "12:00", "endTime": "20:00",
	  "role": "Counter Staff", "status": "Published", "notes": ""
	}, {
	  "date": "2025-05-23", "startTime": "07:00", "endTime": "15:00",
	  "role": "Decorator", "status": "Confirmed_By_Employee", "notes":
	  "Special cake order pickup at 2 PM."
	}
      ]
    }
  ]
} ```

## Phase 5: Second Location & Shift Trading (Version 0.6)

"The Sweet Spot" is opening a second branch, "Sweet Spot Downtown"!

### Feature Ask 0.6: - The schedule must now support multiple bakery locations.
Shifts need to be assigned to a specific location.  - Employees need a way to
offer their shifts up for grabs or request to swap shifts with a colleague.

### JSON Data Schema Changes (`schedule_v0.6.json`): - Add a `locations` array
at the top level, defining each bakery location (e.g., `locationId`, `name`,
`address`).  - Add a `locationId` field to each shift object, referencing an ID
from the `locations` array.  - Introduce a new top-level array: `shiftTrades`.
Each object could include `tradeId`, `originalShiftDetails` (or `shiftId` if
shifts get unique IDs), `offeringEmployeeId`, `requestingEmployeeId` (optional,
for direct swaps), `status` ("Offered", "Claimed", "Approved", "Denied").  - For
this, it's becoming clear that shifts themselves might need unique `shiftId`s
for easier reference in `shiftTrades`.

```json {
  "version": "0.6", "bakeryName": "The Sweet Spot", "locations": [
    {
      "locationId": "loc01", "name": "The Sweet Spot - Original", "address":
      "123 Main St"
    }, {
      "locationId": "loc02", "name": "Sweet Spot - Downtown", "address": "456
      Central Ave"
    }
  ], "employees": [
    {
      "employeeId": "emp101", "name": "Alice Wonderland", "shifts": [
	{
	  "shiftId": "shft001", "locationId": "loc01", "date": "2025-05-19",
	  "startTime": "07:00", "endTime": "15:00", "role": "Counter Staff",
	  "status": "Published", "notes": "Morning rush expected."
	}, {
	  "shiftId": "shft002", "locationId": "loc02", "date": "2025-05-21",
	  "startTime": "12:00", "endTime": "20:00", "role": "Counter Staff",
	  "status": "Published", "notes": ""
	}
      ]
    }
  ], "shiftTrades": [
    {
      "tradeId": "trade701", "shiftId": "shft001", "offeringEmployeeId":
      "emp101", "status": "Offered", "offeredTimestamp": "2025-05-17T10:00:00Z"
    }, {
      "tradeId": "trade702", "shiftId": "shftXYZ", "offeringEmployeeId":
      "emp102", "requestingEmployeeId": "emp103", "requestedShiftId": "shftABC",
      "status": "SwapRequested", "requestedTimestamp": "2025-05-17T11:00:00Z"
    }
  ]
} ```

**Discussion Point:** The introduction of `shiftId` is a crucial step towards a
more relational-like structure within JSON. Discuss why this becomes necessary.

## Phase 6: Skills/Certifications and Shift Break Management (Version 0.7)

Some roles or tasks require specific skills or certifications (e.g., "Food
Handler Permit," "Advanced Cake Decorating"). Also, longer shifts need to have
scheduled breaks.

### Feature Ask 0.7: - Track employee skills and certifications. The scheduling
system should ideally help prevent assigning an unqualified employee.  - Allow
managers to schedule one or more breaks (with start and end times) within a
longer shift.

### JSON Data Schema Changes (`schedule_v0.7.json`): - Add a
`skillsAndCertifications` array to each employee object. Each item could be an
object with `skillName`, `certificationId` (optional), `expiryDate` (optional).
- Add a `requiredSkills` array to shift roles (or directly to shifts if a role
can be at different skill levels). This could be a list of skill names.  - Add a
`breaks` array to each shift object. Each item in this array would be an object
with `breakStartTime` and `breakEndTime`.

```json {
  "version": "0.7", "bakeryName": "The Sweet Spot", "locations": [ /* ... */ ],
  "employees": [
    {
      "employeeId": "emp101", "name": "Alice Wonderland", "primaryRole":
      "Counter Staff", "skillsAndCertifications": [
	{
	  "skillName": "Food Handler Permit", "certificationId": "FHP12345",
	  "expiryDate": "2026-12-31"
	}, {
	  "skillName": "Customer Service Excellence"
	}
      ], "unavailability": [ /* ... */ ], "shifts": [
	{
	  "shiftId": "shft001", "locationId": "loc01", "date": "2025-05-19",
	  "startTime": "07:00", "endTime": "15:00", "role": "Counter Staff",
	  "requiredSkills": ["Food Handler Permit"], "status": "Published",
	  "notes": "Morning rush expected.", "breaks": [
	    {
	      "breakName": "Lunch", "startTime": "11:00", "endTime": "11:30"
	    }
	  ]
	}, {
	  "shiftId": "shft003", "locationId": "loc01", "date": "2025-05-20",
	  "startTime": "06:00", "endTime": "16:00", "role": "Lead Baker",
	  "requiredSkills": ["Food Handler Permit", "Advanced Baking"],
	  "status": "Published", "breaks": [
	    {
	      "breakName": "Morning Break", "startTime": "09:00", "endTime":
	      "09:15"
	    }, {
	      "breakName": "Lunch", "startTime": "12:00", "endTime": "12:30"
	    }
	  ]
	}
      ]
    }
  ]
} ```
