"use client";

import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

interface CircularTextProps {
  text?: string;
  radius?: number;
  onHover?: "slowDown" | "speedUp" | "pause" | "goBonkers";
  spinDuration?: number;
  className?: string;
}

export default function CircularText({
  text = "JOOEEYY*POTFOLIO*",
  radius = 100,
  onHover = "speedUp",
  spinDuration = 20,
  className = "",
}: CircularTextProps) {
  const letters = text.split("");
  const step = 360 / letters.length;

  const { scrollYProgress } = useScroll();
  
  // Rotate based on scroll: 0 scroll = 0 deg, 1 scroll = 360 deg
  // Adding a spring for smooth physics like the "Schultz Schultz" wheel
  const rotateScroll = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const smoothRotate = useSpring(rotateScroll, { stiffness: 50, damping: 20 });

// ... imports moved to top of file if needed
    
  return (
    <motion.div
      className={className}
      style={{
        width: radius * 2,
        height: radius * 2,
        position: "fixed",
        bottom: 40,
        left: 40,
        zIndex: 50,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "50%",
        cursor: "pointer",
        rotate: smoothRotate, // Bind rotation to scroll
      }}
    >
      <div 
        style={{
             position: "absolute",
             width: "100%",
             height: "100%",
        }}
        className="spin-overlay"
      >
          {letters.map((letter, i) => (
            <span
              key={`char-${i}`}
              style={{
                position: "absolute",
                top: "0",
                left: "50%",
                transformOrigin: `0 ${radius}px`,
                transform: `translateX(-50%) rotate(${i * step}deg)`,
                fontSize: "14px",
                fontWeight: "bold",
                fontFamily: "monospace",
                textTransform: "uppercase",
                color: "var(--brand-solid-strong)", // Use theme color
              }}
            >
              {letter}
            </span>
          ))}
      </div>
    </motion.div>
  );
}
