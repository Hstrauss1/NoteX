
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50">
        <header className="border-b px-6 py-3 bg-white dark:bg-neutral-800 shadow-sm">
          <h1 className="text-xl font-bold">NoteX – Demo Mode</h1>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
