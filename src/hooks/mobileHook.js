"use client";
import { useState, useEffect } from "react";

export default function useScreenLimit() {
    const [catLimit, setCatLimit] = useState(2);
    const [blogLimit, setBlogLimit] = useState(3);
    const [categoriesLimit, setCategoriesLimit] = useState(12);
    const [tagsLimit, setTagsLimit] = useState(12);

    useEffect(() => {
        const checkScreen = () => {
            setCatLimit(
                window.innerWidth >= 640 ? 6 : window.innerWidth >= 425 ? 3 : 2,
            );
            setBlogLimit(window.innerWidth >= 640 ? 6 : 3);
            setCategoriesLimit(
                window.innerWidth >= 640
                    ? window.innerWidth >= 768
                        ? 45
                        : 21
                    : 12,
            );
            setTagsLimit(
                window.innerWidth >= 640
                    ? window.innerWidth >= 768
                        ? 45
                        : 21
                    : 12,
            );
        };
        checkScreen();

        window.addEventListener("resze", checkScreen);
        return () => window.removeEventListener("resize", checkScreen);
    }, []);
    return { catLimit, blogLimit, categoriesLimit, tagsLimit };
}
