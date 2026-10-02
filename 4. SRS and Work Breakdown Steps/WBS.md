# Work Breakdown Structure
## Faculty Research Grant & Publication Tracker

This WBS follows the epics, stories, tasks and bugs in the Jira exports in [Project Creation Screenshots](../3.%20Project%20Creation%20Screenshots/): the Scrum space, the Kanban space and the bug tracker. Requirements are in [SRS.md](./SRS.md). Story points (SP) are the relative estimates from the Scrum backlog.

## 1. Project Management
| ID | Work package | Output |
|---|---|---|
| 1.1 | Set up the Jira Scrum, Kanban and bug tracker spaces | Configured spaces |
| 1.2 | Create epics and user stories from the requirements | Backlog (21 items) |
| 1.3 | Prioritise and estimate stories | Priorities and story points |
| 1.4 | Plan and run three sprints, tracking burndown | Sprint logs and burndown charts |
| 1.5 | Set up repository and GitHub project | Repository |

## 2. Requirements and Design
| ID | Work package | Output |
|---|---|---|
| 2.1 | Gather FRs and NFRs | [FRs_and_NFRs.md](../1.%20Requirements/FRs_and_NFRs.md) |
| 2.2 | Write the SRS | [SRS.md](./SRS.md) |
| 2.3 | UML model | [UML diagram](../2.%20Architecture/UML%20DIAGRAM.jpg) |
| 2.4 | Use case and exception flows | [Use case flow spec](../2.%20Architecture/Use%20Case%20Flow%20Spec-1.pdf) |
| 2.5 | Database schema and UI wireframes | Schema, wireframes |

## 3. Foundation
| ID | Work package | Output |
|---|---|---|
| 3.1 | Project skeleton and environments | Running skeleton |
| 3.2 | Authentication and roles (Faculty, Co-Author, Dean) | Login and role checks |

## 4. Epic 1: Track Grant Funds (FR-001), 18 SP
| ID | Jira | Work package | SP | Priority |
|---|---|---|---|---|
| 4.1 | SBPS9-16, KP-17 | Story 1.1: Log an expense (expense logging form) | 5 | High |
| 4.1.1 | KP-18 | Validate expense amount against budget | | |
| 4.2 | SBPS9-17 | Story 1.2: View remaining balance | 3 | Medium |
| 4.3 | SBPS9-18 | Story 1.3: Block overdraft | 5 | High |
| 4.4 | SBPS9-19 | Story 1.4: Dean override | 5 | High |

## 5. Epic 2: Co-Author Approval (FR-002), 8 SP
| ID | Jira | Work package | SP | Priority |
|---|---|---|---|---|
| 5.1 | SBPS9-20, KP-19 | Story 2.1: Notify co-authors (notification flow) | 3 | Medium |
| 5.1.1 | KP-25 | Send approval request email | | |
| 5.2 | SBPS9-21 | Story 2.2: Approve co-authorship | 3 | Medium |
| 5.3 | SBPS9-22 | Story 2.3: Reject co-authorship | 2 | Low |

## 6. Epic 3: Publication Indexing and Citations (FR-003), 13 SP
| ID | Jira | Work package | SP | Priority |
|---|---|---|---|---|
| 6.1 | SBPS9-23, KP-20 | Story 3.1: Register publication | 3 | Medium |
| 6.2 | SBPS9-24 | Story 3.2: Manually update citation count | 2 | Low |
| 6.3 | SBPS9-25 | Story 3.3: Auto-update citations via external index | 8 | Low |
| 6.3.1 | KP-26 | Fetch citation count from external index | | |

## 7. Epic 4: Fund Burn-Up Analytics (FR-004), 8 SP
| ID | Jira | Work package | SP | Priority |
|---|---|---|---|---|
| 7.1 | SBPS9-26, KP-21 | Story 4.1: View own burn-up (Faculty), chart component | 5 | Medium |
| 7.1.1 | KP-27 | Aggregate expense data by date | | |
| 7.2 | SBPS9-27 | Story 4.2: View all burn-up (Dean) | 3 | Medium |

## 8. Epic 5: Grant Applications (FR-005), 11 SP
| ID | Jira | Work package | SP | Priority |
|---|---|---|---|---|
| 8.1 | SBPS9-28, KP-22 | Story 5.1: Submit new grant application (application form) | 5 | High |
| 8.2 | SBPS9-29 | Story 5.2: Submit renewal request | 3 | Medium |
| 8.3 | SBPS9-30 | Story 5.3: Route to Dean for approval | 3 | High |
| 8.3.1 | KP-28 | Route submission to Dean for approval | | |

## 9. Non-Functional Work
| ID | Jira | Work package | Traces to |
|---|---|---|---|
| 9.1 | KP-14, KP-23 | Story 6: Maintain audit ledger (audit ledger writes) | NFR-001 |
| 9.1.1 | KP-29 | Encrypt audit log entries at rest | NFR-001 |
| 9.2 | KP-15, KP-24 | Story 7: Render dashboard within threshold (query optimisation) | NFR-002 |
| 9.2.1 | KP-30 | Add caching for burn-up chart data | NFR-002 |

## 10. Testing and Defect Fixing
| ID | Work package | Output |
|---|---|---|
| 10.1 | Test plan from acceptance criteria | Test plan |
| 10.2 | Unit and integration tests, including exception flows | Passing suites |
| 10.3 | Performance test: dashboard renders in 5 seconds | Benchmark report |
| 10.4 | Security and latency tests on the audit ledger | Test report |
| 10.5 | Fix BTB9-1: negative expense amount accepted | Fix and retest (FR-001) |
| 10.6 | Fix BTB9-2: balance does not update after expense approval | Fix and retest (FR-001) |
| 10.7 | Fix BTB9-3: co-author notification fails for large author lists | Fix and retest (FR-002) |
| 10.8 | Fix BTB9-4: stale citation counts from external index | Fix and retest (FR-003) |
| 10.9 | Fix BTB9-5: burn-up totals incorrect across fiscal years | Fix and retest (FR-004) |

## 11. Release
| ID | Work package | Output |
|---|---|---|
| 11.1 | User documentation | User guide |
| 11.2 | Deploy and hand over | Deployed system |

## Sprint Plan
Total estimate for the five epics is 58 SP. Sprint 1 holds the five High-priority stories (4.1, 4.3, 4.4, 8.1, 8.3), 23 SP, which form the core financial control loop. Stories 7.2 (Dean burn-up view) and 8.2 (renewal request) rolled over as incomplete at the end of the simulated sprints.

## Dependencies
- 3.2 (roles) comes before every epic, since overdraft override and approvals are role-gated.
- 4.4 (Dean override) depends on 4.3 (block overdraft), and 4.3 depends on 4.1.1 (validation against budget).
- 9.1 (audit ledger) must exist before 4.4 and 8.3 are released, since both are approvals that NFR-001 requires to be logged.
- 7.1 depends on 4.1 (expense data) and 7.1.1 (aggregation); 9.2 optimises 7.1.
- 5.2 and 5.3 both depend on 5.1, and 6.3 depends on 6.1.
