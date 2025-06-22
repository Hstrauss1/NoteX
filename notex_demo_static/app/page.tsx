
'use client';
import { demoNotes } from '@/lib/demoNotes';
import Link from 'next/link';

export default function DemoHome() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">📚 NoteX Demo</h1>
      <p className="text-gray-600">Explore sample notes. No login required.</p>
      <div className="grid gap-4">
        {demoNotes.map(note => (
          <div key={note.id} className="p-4 border rounded-lg bg-white dark:bg-neutral-800 shadow-sm">
            <h2 className="font-semibold">{note.course}</h2>
            <p className="text-sm text-gray-700">{note.title}</p>
            <a href={note.file} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mt-2 inline-block">
              View PDF
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
