"use client";
import { useDateFilter } from "@/app/hooks/useDateFilter";
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function FilterBar() {
  const { from, to, handleFromSearch, handleToSearch } = useDateFilter();
  return (
    <div className="flex flex-col gap-4 items-center p-6 bg-white shadow-lg rounded-lg max-w-2xl mx-auto">
      <div className="flex max-sm:flex-col gap-4">
        <DatePicker
          selected={from}
          onChange={(date: Date | null) => handleFromSearch(date)}
          dateFormat="dd/MM/yyyy"
          placeholderText="اختر تاريخ البداية"
          className="text-sm max-sm:text-xs border border-gray-200 rounded px-3 py-2 text-center w-full focus:outline-none focus:ring-2 focus:ring-blue-500 hover:shadow-md transition-shadow"
          isClearable
        />
        <DatePicker
          selected={to}
          onChange={(date: Date | null) => handleToSearch(date)}
          dateFormat="dd/MM/yyyy"
          placeholderText="اختر تاريخ النهاية"
          className="text-sm max-sm:text-xs border border-gray-200 rounded px-3 py-2 text-center w-full focus:outline-none focus:ring-2 focus:ring-blue-500 hover:shadow-md transition-shadow"
          isClearable
        />
      </div>
      <div className="text-sm text-gray-500 mt-2 text-center">
        اختر نطاق التاريخ لتصفية النتائج بشكل أفضل.
      </div>
    </div>
  );
}

