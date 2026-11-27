export const STUDENT_ASSIGNED = 'student.assigned';

export class StudentAssignedEvent {
  constructor(
    readonly studentId: string,
    readonly researcherId: string,
  ) {}
}
