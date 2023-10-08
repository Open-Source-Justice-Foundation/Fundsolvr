"use client";

import React, { useState } from "react";

import dynamic from "next/dynamic";

import MarkdownIt from "markdown-it";
// import "react-markdown-editor-lite/lib/index.css";
import './markdown-editor.css'

const mdParser = new MarkdownIt(/* Markdown-it options */);

const MdEditor = dynamic(() => import("react-markdown-editor-lite"), {
  ssr: true,
});

export default function CreateBounty() {
  // Declare a state variable for the text input
  const [inputValue, setInputValue] = useState("");

  // Handler for the input change event
  const handleInputChange = (event: any) => {
    setInputValue(event.target.value);
  };

  function handleEditorChange({ html, text }: any) {
    console.log("handleEditorChange", html, text);
  }

  return (
    <div className="lg:pl-72">
      <main className="mx-auto max-w-3xl py-4">
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-100">Create Bounty</h1>
          <div className="mt-8">
            <h2 className="text-gray-100">Title</h2>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              className="mt-4 w-full rounded border border-gray-600 bg-gray-700 text-gray-100 p-2"
              placeholder="Bounty title"
            />
            <h2 className="pt-8 pb-4 text-gray-100">Content</h2>
            <MdEditor
              config={{
                view: {
                  menu: true,
                  md: true,
                  html: false,
                },
              }}
              style={{
                width: "100%",
                height: "500px",
              }}
              renderHTML={(text) => mdParser.render(text)}
              onChange={handleEditorChange}
            />

            <h2 className="text-gray-100 pt-8">Reward (sats)</h2>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              className="mt-4 w-full rounded border border-gray-600 bg-gray-700 text-gray-100 p-2"
              placeholder="Value in sats"
            />
            <h2 className="text-gray-100 pt-8">Tags</h2>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              className="mt-4 w-full rounded border border-gray-600 bg-gray-700 text-gray-100 p-2"
              placeholder="Comma separated tags"
            />
            <div className="mt-6 flex items-center justify-between">
              <button className="flex items-center gap-x-2 rounded-lg bg-blue-700 px-3 py-2 text-sm font-medium text-gray-200">
                Create Bounty
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
