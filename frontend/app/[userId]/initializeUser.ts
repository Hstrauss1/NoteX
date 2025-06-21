"use server";

import { redirect } from "next/navigation";
import { Account } from "../types";

export const initializeUser = async (
  userId: string,
  avatar: string,
  name: string,
  token: string
) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/initialize-user/${userId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        avatar: avatar,
        name: name,
      }),
    }
  );

  if (!res.ok) redirect("/error");
  return (await res.json()) as Account;
};

export const getUser = async (userId: string, token: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/user/${userId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) throw new Error("Failed to fetch user data");
  return (await res.json()) as Account;
};

export const updateUser = async (
  userId: string,
  token: string,
  data: { name: string; avatar: string }
) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/user/${userId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!res.ok) redirect("/error");
  return (await res.json()) as Account;
};

export const deleteUser = async (userId: string, token: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/user/${userId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) redirect("/error");
  return (await res.json()) as Account;
};
