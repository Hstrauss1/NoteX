import Link from "next/link";
import Logo from "../public/Notex_Logo.svg";
import Image from "next/image";

export default async function Home() {
  return (
    <div className="w-full h-full">
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <Image
          src={Logo}
          width={100}
          height={100}
          alt="Notex Logo"
          className="mb-2"
        />
        <hgroup className="text-center">
          <h1 className="text-3xl font-bold mb-3 text-gradient text-neutral-800 dark:text-neutral-200">
            Notex
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            A platform to share and discover notes.
          </p>
        </hgroup>
        <Link
          href={`/signin`}
          className="px-7 py-2 rounded-lg bg-neutral-800 text-neutral-50 font-semibold shadow-lg hover:bg-neutral-700 transition-colors text-lg active:scale-95 duration-300"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}
