import { SetMetadata } from '@nestjs/common';

export const STUDY_DATA_KEY = 'studyData';

/** Study data: only saved for a student who has consented and hasn't withdrawn. */
export const StudyData = () => SetMetadata(STUDY_DATA_KEY, true);
