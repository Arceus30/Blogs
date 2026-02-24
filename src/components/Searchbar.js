"use client";
import api from "@/lib/api";
import { useState, useEffect, useRef } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { fullName } from "@/utils/formatName";
import { useToast } from "@/context/toast-provider";

const LIMIT = 5;

export default function Searchbar() {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);
    const router = useRouter();
    const { setToast } = useToast();

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (!query || query.length <= 2) {
                setSuggestions([]);
                return;
            }
            const search = async () => {
                try {
                    const response = await api.get(
                        `${process.env.NEXT_PUBLIC_SEARCH_SUGGESTIONS_API}?q=${encodeURIComponent(query)}&limit=${encodeURIComponent(LIMIT)}`,
                    );
                    setSuggestions(response.data.search_suggestions);
                    setShowDropdown(true);
                } catch (err) {
                    const errorMessage =
                        err?.response?.data?.message || err?.message;
                    setSuggestions([]);
                    setToast(errorMessage, "error");
                    console.error("Search suggestions error:", errorMessage);
                }
            };
            search();
        }, 1000);
        return () => clearTimeout(timeoutId);
    }, [query, setToast]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                !inputRef?.current?.contains(event.target) &&
                !dropdownRef?.current?.contains(event.target)
            ) {
                setShowDropdown(false);
                setSuggestions([]);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            const search = query.trim();
            inputRef.current = "";
            setQuery("");
            setShowDropdown(false);
            setSuggestions([]);
            const searchUrl = `/search?q=${encodeURIComponent(search)}`;
            window.location.href = searchUrl;
        }
    };

    const handleSuggestionClick = (suggestion, item) => {
        let route = "";
        if (suggestion === "blogs") {
            route = `${process.env.NEXT_PUBLIC_BLOG}/${item.slug}`;
        } else if (suggestion === "categories") {
            route = `${process.env.NEXT_PUBLIC_CATEGORY}/${item.slug}`;
        } else if (suggestion === "tags") {
            route = `${process.env.NEXT_PUBLIC_TAG}/${item._id}`;
        } else if (suggestion === "authors") {
            route = `${process.env.NEXT_PUBLIC_AUTHOR}/${item._id}`;
        }
        setShowDropdown(false);
        setSuggestions([]);
        router.replace(route);
    };

    const clearSearch = () => {
        setQuery("");
        setSuggestions([]);
        setShowDropdown(false);
    };

    return (
        <>
            <form
                onSubmit={handleSubmit}
                className="w-full relative flex justify-end"
            >
                <input
                    id="query"
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowDropdown(e.target.value.length > 1);
                    }}
                    placeholder="Search ..."
                    className="w-full px-5 sm:px-2 py-3 text-gray-900 placeholder-gray-500 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-300 pr-12"
                />
                <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                >
                    <FaSearch className="w-5 h-5" />
                </button>
                {query && (
                    <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-14 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                    >
                        <FaTimes className="w-4 h-4" />
                    </button>
                )}
            </form>

            {showDropdown && Object.keys(suggestions).length > 0 && (
                <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl z-50 max-h-96 overflow-y-auto"
                >
                    <div className="py-2 max-h-96">
                        {Object.keys(suggestions).map((suggestion, idx) => {
                            return (
                                <div
                                    className="border-b border-gray-100 mb-2 pb-2"
                                    key={idx}
                                >
                                    <h4 className="px-4 py-2 text-sm font-semibold text-red-500 uppercase tracking-wide">
                                        {suggestion}
                                    </h4>
                                    {suggestions[suggestion].map(
                                        (item, jdx) => {
                                            return (
                                                <button
                                                    key={item._id || jdx}
                                                    onClick={() =>
                                                        handleSuggestionClick(
                                                            suggestion,
                                                            item,
                                                        )
                                                    }
                                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none rounded-lg"
                                                >
                                                    <div className="text-sm font-medium text-gray-900 truncate">
                                                        {suggestion === "blogs"
                                                            ? item.title
                                                            : suggestion ===
                                                                "tags"
                                                              ? item.name
                                                              : suggestion ===
                                                                  "categories"
                                                                ? item.name
                                                                : suggestion ===
                                                                    "authors"
                                                                  ? fullName(
                                                                        item?.firstName,
                                                                        item?.lastName,
                                                                    )
                                                                  : ""}
                                                    </div>
                                                </button>
                                            );
                                        },
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {showDropdown && suggestions.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl z-50">
                    <div className="px-5 py-4 text-center text-gray-500 text-sm">
                        No suggestions found
                    </div>
                </div>
            )}
        </>
    );
}
