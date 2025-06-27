"use client";
import React from "react";
import { Boxes } from "@/components/ui/background-boxes"; // adjust path if needed

export function BackgroundBoxesDemo() {
    return (
        <div className="relative w-full h-96 my-12 rounded-xl overflow-hidden bg-gray-900 flex flex-col items-center justify-center">
            {/* mask fade to white for smoother transition */}
            <div className="absolute inset-0 w-full h-full z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />

            {/* aceternity Boxes background */}
            <Boxes />

            {/* overlay content */}
            <div className="relative z-30 text-center">
                <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow">
                    Never Alone. Always Welcome.
                </h1>
                <p className="text-base md:text-lg text-neutral-300 mt-3 px-4 max-w-2xl mx-auto">
                    Join us in the gloom for Fitness, Fellowship, and Faith.
                </p>
            </div>
        </div>
    );
}
