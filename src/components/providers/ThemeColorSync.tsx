"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export function ThemeColorSync() {
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        let metaBox = document.querySelector('meta[name="theme-color"]');
        if (!metaBox) {
            metaBox = document.createElement("meta");
            metaBox.setAttribute("name", "theme-color");
            document.head.appendChild(metaBox);
        }

        if (resolvedTheme === "dark") {
            metaBox.setAttribute("content", "#0f172a");
        } else {
            metaBox.setAttribute("content", "#ffffff");
        }
    }, [resolvedTheme]);

    return null;
}
