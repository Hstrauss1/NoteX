export interface Note {
  id: string;
  course: string;
  title: string;
  file: string; // path to PDF in /public/sample/
}

export const demoNotes: Note[] = [
  {
    id: 'armv7',
    course: 'COEN 20',
    title: 'ARMv7 Assembly Cheat Sheet',
    file: '/sample/ARMv7-cheat-sheet.pdf',
  },
  {
    id: 'eng-guide',
    course: 'ENGR 1',
    title: 'Engineering Instructions (Paper House)',
    file: '/sample/Engineering Instructions.pdf',
  },
  {
    id: 'week5-lab',
    course: 'ENGR 1L',
    title: 'Engineering Lab Week 5: Potentiometer, Switches, Photoresistor',
    file: '/sample/EngineeringWeek5.pdf',
  },
  {
    id: 'katakana',
    course: 'JAPN 1',
    title: 'Katakana Practice KP3',
    file: '/sample/Jap KP3.pdf',
  },
  {
    id: 'hp11-13',
    course: 'MATH 11',
    title: 'Homework Problems 11–13',
    file: '/sample/hp11-13 (1).pdf',
  },
];
