# Software Requirements Specification
## Faculty Research Grant & Publication Tracker (MyProject_Grant_Tracker)



## 1. Introduction

### 1.1 Purpose
This document specifies the requirements for the Faculty Research Grant & Publication Tracker, a web portal for the research deanery. It is intended for the individual the project has been assigned to, the course evaluators and the Research Dean as the primary stakeholder.

### 1.2 Scope
The portal tracks sponsored research grants, faculty publication metrics (indexing and citations), co-author approval workflows, and fund burn-up analytics. It replaces spreadsheet and email based tracking with a single system of record.

Out of scope: payroll, institutional accounting integration, and the actual disbursement of funds.

### 1.3 Definitions
| Term | Meaning |
|---|---|
| Grant | A sponsored research fund with a sanctioned budget |
| Burn-up | Cumulative expenditure plotted against sanctioned budget over time |
| Overdraft | An expense that would exceed a grant's remaining balance |
| Confirmed | Publication status reached only after all co-authors approve |
| Dean | The Research Dean, who holds approval authority |

### 1.4 References
- [FRs_and_NFRs.md](../1.%20Requirements/FRs_and_NFRs.md) and its [PDF version](../1.%20Requirements/Functional%20and%20Non%20Functional%20Reqs.pdf)
- [UML diagram](../2.%20Architecture/UML%20DIAGRAM.jpg)
- [Use case flow specification](../2.%20Architecture/Use%20Case%20Flow%20Spec-1.pdf)

---

## 2. Overall Description

### 2.1 Product Perspective
A standalone web portal. It depends on an external publication index service (for citation lookup) and a notification channel (for co-author alerts).

### 2.2 User Classes
| User | Responsibilities |
|---|---|
| Faculty Researcher | Applies for grants, logs expenses, registers publications, updates citations, views analytics |
| Co-Author | Approves or rejects publications they are credited on |
| Research Dean | Approves applications and overdrafts, monitors analytics across all grants, reviews the audit ledger |

### 2.3 Operating Environment
Modern desktop and mobile web browsers; a server-side application with a persistent database.

### 2.4 Assumptions and Dependencies
- Every user is authenticated and has exactly one role per session.
- The external citation index may be slow or unavailable at any time.
- Grant sanctioned budgets are entered by an authorised user and treated as the source of truth.

---

## 3. Functional Requirements

### FR-001 Grant Fund Allocation and Expense Logging [High]
1. The system shall record the sanctioned allocation for each grant.
2. The system shall let a Faculty Researcher log equipment procurement expenses against a grant.
3. The system shall recompute and display the remaining balance after every expense.
4. The system shall block any expense that would cause an overdraft unless the Dean explicitly approves it.

**Acceptance:** balances are always accurate; no overdraft is recorded without Dean approval.

### FR-002 Co-Author Approval Workflow [High]
1. On submission of a publication with co-authors, the system shall notify every co-author.
2. The system shall notify co-authors again on each subsequent change to the publication.
3. The system shall mark a publication "Confirmed" only after every co-author has explicitly approved.

**Acceptance:** no co-author is missed; no publication is Confirmed without all approvals.

### FR-003 Publication Indexing and Citation Update [Medium]
1. The system shall let faculty register a publication.
2. The system shall let faculty update citation counts via external index lookup.
3. If the lookup fails or is unavailable, the system shall let faculty enter citation counts manually.

**Acceptance:** citations can always be updated, by lookup or by hand.

### FR-004 Fund Burn-Up Analytics [Medium]
1. The system shall show, per grant, cumulative expenditure against the sanctioned budget over time.
2. The view shall be available to both Faculty Researchers and the Dean.
3. The view shall project expected cumulative expenditure so under- and overspending can be spotted.

**Acceptance:** charts are accurate and readable by all permitted roles.

### FR-005 Grant Application / Renewal Submission [Low]
1. The system shall let a Faculty Researcher submit a new grant application or renewal request.
2. The application shall include proposal details and a requested budget.
3. The system shall reject applications that are incomplete or insufficiently detailed.
4. The system shall route accepted applications to the Dean.

**Acceptance:** complete applications reach the Dean; vague ones are rejected.

---

## 4. Non-Functional Requirements

### NFR-001 Audit Ledger (Performance and Security)
The system shall keep an immutable, tamper-evident audit trail of all financial approvals and status changes. Entries shall be append-only. Benchmark tests shall confirm target latency, and security tests shall confirm the applicable security standards are met.

### NFR-002 Dashboard Performance (Usability)
The burn-up dashboard (FR-004) shall load and render all charts for a grant within 5 seconds.

---

## 5. Exception Flows and Error Handling
Detailed exception flows are in the [use case flow specification](../2.%20Architecture/Use%20Case%20Flow%20Spec-1.pdf). The key behaviours are:

| Situation | Required behaviour |
|---|---|
| Expense exceeds remaining balance | Reject and hold for Dean decision |
| Co-author does not respond | Publication stays unconfirmed |
| External citation index fails | Fall back to manual entry |
| Incomplete grant application | Reject with a message naming the missing details |

---

## 6. Traceability

| Requirement | Priority | Primary actor | Rationale |
|---|---|---|---|
| FR-001 | High | Faculty, Dean | Prevent unaccountable overspending |
| FR-002 | High | Faculty, Co-Author | Authorship integrity of metrics |
| FR-003 | Medium | Faculty | Faculty evaluation and department reporting |
| FR-004 | Medium | Faculty, Dean | Early view of funding risk |
| FR-005 | Low | Faculty, Dean | Formal gate before funds are committed |
| NFR-001 | n/a | Dean | Governance compliance and dispute resolution |
| NFR-002 | n/a | All | Usability near reporting deadlines |
