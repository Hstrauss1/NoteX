"use server";
import { generateText, tool } from "ai";
import { z } from "zod";
import { google } from "@ai-sdk/google";
import { getNoteData } from "./note/[noteId]/getNoteData";
import { Note } from "../types";

export const extractCourseInfo = async (query: string) => {
  const result = await generateText({
    model: google("gemini-2.0-flash"),
    prompt: query,
    system: `
You are a helpful assistant that extracts structured course codes from user queries. 

Your job is to identify the most likely course **prefix** (e.g., ARTH, CSEN, MATH, ENGL, ENGR, CHIN, ELEN, SOCI and more) and **number** (e.g., 117, 20) from a given user input, and return them in a standardized format.

- Course prefixes are 2–6 uppercase letters, sometimes formed from acronyms or department names (e.g., "Art History" → "ARTH", "Computer Science and Engineering" → "CSEN").
- The course number is typically 1–3 digits, often at the end of the sentence.
- If the input already contains a compact code like "csen20", convert it to uppercase and split it into prefix and number.
- Mathematics is math.
- The user will give you the course name.
- Ignore any extra text not related to the course name or number.

Return only the extracted prefix and number. Do not explain anything.

Examples:
- "Art history 117" → { course: "ARTH", number: "117" }
- "Computer science and engineering 20" → { course: "CSEN", number: "20" }
- "csen20" → { course: "CSEN", number: "20" }
- "Amth108" → { course: "AMTH", number: "108" }
`,
    tools: {
      courseFinder: tool({
        description: "Extract course title and number from user input",
        parameters: z.object({
          course: z
            .string()
            .describe("The course prefix, like ARTH, CSEN, AMTH"),
          number: z.string().describe("The course number, like 117 or 20"),
        }),
        execute: async ({ course, number }) => {
          return { course, number };
        },
      }),
    },
  });

  return result.toolResults[0].result as {
    course: string;
    number: string;
  };
};

export const searchCourse = async (
  course: string,
  number: string,
  token: string
) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/search?q=${course}+${number}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to search course");
    }
    const data = await response.json();

    const notes = await Promise.all(
      data.map(async (tag: { note_id: string; tag: string }) => {
        return await getNoteData(tag.note_id, token);
      })
    );

    return {
      status: "success",
      data: notes as Note[],
    };
  } catch (err) {
    console.error("Error uploading note:", err);
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
};
