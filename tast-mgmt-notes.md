
------------------------


## Phase 3: Managing Multiple Weeks and Shift Status (Version 0.4)

Planning just one week at a time isn't cutting it. They need to plan for
multiple weeks and also track if a shift is confirmed or just a draft.

### Feature Ask 0.4: - The schedule should now be by specific dates, not just
`dayOfWeek`.  - Allow schedules to be planned for several weeks in advance.  -
Each shift needs a `status` (e.g., "Draft", "Published",
"Confirmed_By_Employee").



Let's simplify change requests with simpler status fields and enums (e.g., "Requested",
"Approved", "Denied") and ("Offered", "Claimed").


Add employee skills and certifications, like   "skillsAndCertifications": [
	{
	  "skillName": "Food Handler Permit", "certificationId": "FHP12345",
	  "expiryDate": "2026-12-31"
	}, {
	  "skillName": "Customer Service Excellence"
	}
  ]

