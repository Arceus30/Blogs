"use client";
import { RxHamburgerMenu } from "react-icons/rx";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect } from "react";

export default function SidebarComponent() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add("sidebar-open");
        } else {
            document.body.classList.remove("sidebar-open");
        }
        return () => document.body.classList.remove("sidebar-open");
    }, [isOpen]);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="cursor-pointer hover:opacity-50 mx-3 my-1 py-1"
            >
                <RxHamburgerMenu size={40} />
            </button>
            {isOpen && <Sidebar setIsOpen={setIsOpen} />}
        </>
    );
}
