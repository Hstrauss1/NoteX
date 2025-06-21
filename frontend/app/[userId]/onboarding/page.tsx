import React from "react";
import { FileUp, Lock, MessageCircle, Star, Heart, Stars } from "lucide-react";
import Logo from "../../../public/Notex_Logo.svg";
import Image from "next/image";

export default function OnboardingPage() {
  return (
    <section className="p-6 flex flex-col items-center h-full">
      <div className="max-w-3xl">
        <div className="flex items-center gap-4 border border-transparent border-b-neutral-200 p-3">
          <Image src={Logo} width={70} height={70} alt="Notex Logo" />
          <div className="flex flex-col gap-1">
            <h1 className="font-bold text-5xl">Welcome to Notex!</h1>
            <p className="text-sm pl-1">
              Notex is a note-taking app that allows you to create, organize,
              and share your notes with ease.
            </p>
          </div>
        </div>
        <div className=" w-full flex items-center justify-between p-3 pt-7">
          <div className="w-5/6">
            <h2 className="font-semibold text-xl"> Upload Your Notes</h2>
            <p className="text-sm">
              Click the Create tab in the sidebar. Enter your note title (e.g.,
              “Fall quarter 2024”) and course name (e.g., “CSEN 146”). Then
              click Choose File to upload your note from your computer. Once
              selected, click the black Create Note button to save it. You’ll
              earn 1 point for each note you upload.
            </p>
          </div>
          <FileUp className="w-18 h-18 text-red-500 mt-1" />
        </div>
        <div className=" w-full flex items-center justify-between p-3 pt-6">
          <div className="w-5/6">
            <h2 className="font-semibold text-xl">
              Unlock to View other Notes
            </h2>
            <p className="text-sm">
              You can unlock and view other users’ notes by spending points,
              each unlock requires 1 point. Earn points by uploading your own
              notes or through other means. Access available notes by clicking
              on the “Notes” tab in the sidebar. Unlocking is not restricted to
              users who have uploaded notes; as long as you have points, you can
              unlock and view others’ notes.
            </p>
          </div>
          <Lock className="w-18 h-18 text-neutral-700 dark:text-neutral-200 mt-1" />
        </div>
        <div className=" w-full flex items-center justify-between p-3 pt-6">
          <div className="w-5/6">
            <h2 className="font-semibold text-xl"> Comment and Rate Notes</h2>
            <p className="text-sm">
              You can comment on and rate notes you unlock. This helps other
              users find high-quality notes. To comment, click on the note you
              want to comment on, scroll down to the comments section, and enter
              your comment. To rate a note, click the star rating below the note
              title. Your feedback is valuable to the community!
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <MessageCircle className="w-18 h-18 text-blue-500 mt-1" />
          </div>
        </div>
        <div className=" w-full flex items-center justify-between p-3 pt-6">
          <div className="w-5/6">
            <h2 className="font-semibold text-xl">
              Create Like Notes Collection
            </h2>
            <p className="text-sm">
              When you like a note from another user, it will be saved in your
              Likes tab in the sidebar. All notes you like are collected there
              for easy access, so you can quickly find and revisit your favorite
              notes at any time. You can only like a note after you have
              unlocked it.
            </p>
          </div>
          <Heart className="w-18 h-18 text-pink-500 mt-1" />
        </div>
        <div className="w-full flex items-center justify-between p-3 pt-6">
          <div className="w-5/6">
            <h2 className="font-semibold text-xl">Engage and Earn Points</h2>
            <p className="text-sm">
              At Notex, we believe in fostering an active and supportive
              community. To encourage meaningful participation, you will earn 1
              point each time you leave a comment on someone else’s note. This
              helps create a vibrant environment where users share feedback, ask
              questions, and help each other grow. So don’t hesitate to
              engage—your contributions are valued and rewarded!
            </p>
          </div>
          <Star className="w-18 h-18 text-yellow-400 mt-1" />
        </div>
      </div>
    </section>
  );
}
