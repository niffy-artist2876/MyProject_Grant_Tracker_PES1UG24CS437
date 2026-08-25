# SE-lab-PES1UG24CS437

## PROBLEM STATEMENT:
### Faculty Research Grant & Publication Tracker
The research deanery requires an automated portal to track sponsored research grants, faculty
publication metrics (indexing, citations), co-author approval workflows, and fund burn-up analytics.

## Functional Requirements:
### 1. FR-001 [High Priority]: Grant Fund Allocation and Expense Logging:
#### Description:
- Track Grant Fund Allocations
- Let Faculty Log Equipment Procurement Expenses
- Compute remaining budgetary balance
- Block overdraft without Dean override
#### Acceptance Criteria:
Pass:
- Computes budgetary balance updates accurately 
- Blocks overdraft successfully until the Dean approves to do the contrary

Fail:
- Fails to compute balances accurately which leads to accounting discrepancies
- Allows overdraft without the supervision of Dean
  
#### Rationale:
Without it, grant funds could be overspent with no accountability. It directly enables the Research Dean's oversight role.

### 2. FR-002 [High Priority]: Co-Author Approval Workflow: 
#### Description:
When a faculty researcher submits a publication with co-authors:
- The system shall notify each co-author
- The system must require their explicit approval before the publication is marked "Confirmed"
- Analogous to version control but for publications
#### Acceptance Criteria:
Pass:
- The system successfully notifies each co-author upon each change made to the publication
- The system successfully accepts approval of each co-author

Fail:
- The system fails to notify any co-author or some co-authors out of all the co-authors
- The system fails to take explicit approval of each co-author and marks the publication "Confirmed" anyway

#### Rationale:
Publication metrics attributed to a faculty member must reflect authorship. Without an approval step, integrity of publication would be collapsed.

### 3. FR-003 [Medium Priority]: Publication Indexing and Citation Update:
#### Description:
- Allows faculty to register a publication and periodically update citation counts, either manually or via an external index lookup
#### Acceptance Criteria:
Pass:
- The system successfully allows the faculty to update citation counts
- The external index lookup is fast and work with no problems
- There exists a graceful fallback mechanism to update citation counts manually if the lookup doesn't work

Fail:
- The system fails to register the publication
- The pipeline to load the external index lookup is broken or suboptimal  
- There exists no mechanism to update citation manually

#### Rationale:
This is a mechanism for capturing and maintaining the data. This is useful for both faculty evaluation and department-level reporting.

### 4. FR-004 [Medium Priority]: Fund Burn-Up Analytics:
#### Description:
- The system should generate a burn-up view per grant showing cumulative expenditure against sanctioned budget over time
- The system should be viewable by both faculty and the Dean
#### Acceptance Criteria:
Pass:
- The system uses a reliable model to predict the cumulative expenditure of each grant
- Anyone from the faculty, including the Dean, can see and interpret the data

Fail:
- The model mispredicts cumulative expenditures, or predicts expenditures with lower accuracy
- No one from the faculty can see the data

#### Rationale:
The Dean needs an aggregated and time-based view to spot underspending, overspending, or funding risk across grants before deadlines or renewal cycles.

### 5. FR-005 [Low Priority]: Grant Application/Renewal Submission:
#### Description:
- The system shall let a Faculty Researcher submit a new grant application or renewal request, something like an ATS resume filter system
- The application must contain proposal details and requested budget
- The application must be routed to the Dean
#### Acceptance Criteria:
Pass:
- The system successfully routes the application or renewal request to the Dean
- The system allows applications which contain detailed criteria and rejects those which aren't detailed enough

Fail:
- The system fails to route the application to the Dean
- The system accepts vague or incomplete details

#### Rationale:
This mechanism gives the Dean a formal gate to approve funding before money is committed.


## Non-Functional Requirements:

### NFR-001 [Type: Performance and Security]: Audit Ledger
#### Description:
- The system should maintain an immutable, tamper-evident audit trail for all financial approvals and journal status changes.
#### Acceptance Criteria:
Pass:
- Benchmarking tests confirm target latency 
- Security tests confirm that security standards have been upheld

Fail:
- Benchmarking tests do not reach target latency
- Security tests fail the security standards

#### Rationale:
The dean needs a tamper-proof trail to satisfy funding-body compliance with internal governance and to resolve disputes.


### NFR-002 [Type: Usability]: Dashboard Analytics
#### Description:
- The system shall render the fund burn-up analytics dashboard (FR-004) within a defined time threshold.
#### Acceptance Criteria:
Pass:
- Dashboard loads and renders all charts within 5 seconds for a grant

Fail:
- Render time exceeds 5 seconds

#### Rationale:
Slow-loading dashboards undermine usability and discourage regular use, especially near grant reporting deadlines.
