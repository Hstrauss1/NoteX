import React from "react";
import SearchBar from "@/components/SearchBar";

type ClientSearchBarWrapperProps = {
  isLoggedIn: boolean;
};

export function ClientSearchBarWrapper({ isLoggedIn }: ClientSearchBarWrapperProps) {
  if (!isLoggedIn) return null;
  return <SearchBar />;
}
