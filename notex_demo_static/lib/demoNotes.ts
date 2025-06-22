export interface Note {
  id: string;
  course: string;
  title: string;
  file: string;
  tags?: string[];
  votes?: number;
}

export const demoNotes: Note[] = [
  {
    id: 'armv7',
    course: 'COEN 20',
    title: 'ARMv7 Assembly Cheat Sheet',
    file: '/sample/ARMv7-cheat-sheet.pdf',
    tags: ['assembly', 'reference'],
    votes: 23,
  },
  {
    id: 'eng-guide',
    course: 'ENGR 1',
    title: 'Engineering Instructions (Paper House)',
    file: '/sample/Engineering Instructions.pdf',
    tags: ['design', 'competition'],
    votes: 15,
  },
  {
    id: 'week5-lab',
    course: 'ENGR 1L',
    title: 'Engineering Lab Week 5',
    file: '/sample/EngineeringWeek5.pdf',
    tags: ['lab', 'engineering'],
    votes: 11,
  },
  {
    id: 'katakana',
    course: 'JAPN 1',
    title: 'Katakana Practice KP3',
    file: '/sample/Jap KP3.pdf',
    tags: ['japanese', 'writing'],
    votes: 17,
  },
  {
    id: 'hp11-13',
    course: 'MATH 11',
    title: 'Homework Problems 11–13',
    file: '/sample/hp11-13 (1).pdf',
    tags: ['math', 'homework'],
    votes: 9,
  },
];
