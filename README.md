# MyProject_Grant_Tracker

## PROBLEM STATEMENT:
### Faculty Research Grant & Publication Tracker
The research deanery requires an automated portal to track sponsored research grants, faculty
publication metrics (indexing, citations), co-author approval workflows, and fund burn-up analytics.

Universities fund a large share of their research through sponsored grants, and faculty also produce
publications whose metrics feed into evaluation and reporting. Today this is typically handled with
spreadsheets, emails and ad-hoc paperwork, which makes it hard for the Research Dean to see how money
is being spent, whether a publication's authorship is genuine, or whether a grant is at risk before its
deadline or renewal. This project is a single portal that addresses those gaps.

### Users
- **Faculty Researcher**: applies for grants, logs expenses, registers publications and updates citations.
- **Co-Author**: a faculty member who must approve a publication they are credited on.
- **Research Dean**: oversees funding, approves applications and overdrafts, and monitors analytics.

### Core capabilities
| Area | What the portal does | Requirement |
|---|---|---|
| Grant funds | Tracks sanctioned allocations, lets faculty log equipment/procurement expenses, computes the remaining balance and blocks overdraft unless the Dean overrides | FR-001 |
| Co-author approval | Notifies every co-author of a submitted publication and keeps it unconfirmed until each one explicitly approves, similar to a review flow in version control | FR-002 |
| Publication metrics | Registers publications and keeps citation counts current, via an external index lookup with a manual fallback | FR-003 |
| Fund burn-up analytics | Shows cumulative expenditure against the sanctioned budget over time, per grant, for faculty and the Dean | FR-004 |
| Grant applications | Lets faculty submit new or renewal applications with proposal details and budget, routed to the Dean and rejected if incomplete | FR-005 |

### Key quality attributes
- **Auditability (NFR-001)**: an immutable, tamper-evident audit trail for all financial approvals and status changes.
- **Responsiveness (NFR-002)**: the burn-up dashboard renders within 5 seconds for a grant.

## Repository Structure

| Folder | Contents |
|---|---|
| [1. Requirements](./1.%20Requirements/) | Functional and non-functional requirements with acceptance criteria and rationales: [FRs_and_NFRs.md](./1.%20Requirements/FRs_and_NFRs.md) and the [PDF version](./1.%20Requirements/Functional%20and%20Non%20Functional%20Reqs.pdf) |
| [2. Architecture](./2.%20Architecture/) | The [UML diagram](./2.%20Architecture/UML%20DIAGRAM.jpg) and the [use case flow specification](./2.%20Architecture/Use%20Case%20Flow%20Spec-1.pdf), including exception flows |
