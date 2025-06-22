"use client";
import React, { useState } from "react";
import { Input } from "./input";
import { Button } from "./button";
import { Plus, X } from "lucide-react";
import Tag from "./tag";

function TagInput({ name = "tags" }: { name?: string }) {
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setInputValue(e.target.value);

  const addTag = () => {
    if (inputValue.trim() !== "") {
      setTags([...tags, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeTag = (index: number) =>
    setTags(tags.filter((_, i) => i !== index));

  return (
    <div className="grid gap-2 w-full">
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder="Enter tags..."
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addTag();
            }
          }}
        />
        <Button variant="secondary" type="button" onClick={() => addTag()}>
          <Plus />
        </Button>
      </div>
      <input type="hidden" name={`${name}-count`} value={tags.length} />
      <div className="flex flex-wrap gap-1">
        {tags.map((tag, index) => (
          <Tag key={index} name={tag}>
            <input
              type="hidden"
              name={`${name}-${index + 1}`}
              value={tag
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9\-]/g, "")}
            />
            <button
              type="button"
              className="[&_svg]:size-3.5 [&_svg]:shrink-0 cursor-pointer opacity-50 hover:opacity-30"
              onClick={() => removeTag(index)}
            >
              <X />
            </button>
          </Tag>
        ))}
      </div>
    </div>
  );
}

export default TagInput;
