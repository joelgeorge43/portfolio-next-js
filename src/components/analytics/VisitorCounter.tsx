"use client";

import { useEffect, useState } from "react";
import { Text } from "@once-ui-system/core";

export default function VisitorCounter() {
  const [count, setCount] = useState<number>(0);
  const [displayCount, setDisplayCount] = useState<number>(0);

  useEffect(() => {
    fetchVisitorCount();
  }, []);

  useEffect(() => {
    // Animate the counter
    if (displayCount < count) {
      const timer = setTimeout(() => {
        setDisplayCount(displayCount + 1);
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [displayCount, count]);

  const fetchVisitorCount = async () => {
    try {
      const res = await fetch("/api/analytics/stats");
      if (res.ok) {
        const data = await res.json();
        setCount(data.totalVisitors || 0);
      }
    } catch (error) {
      console.error("Failed to fetch visitor count:", error);
    }
  };

  return (
    <Text variant="heading-strong-l" style={{ fontVariantNumeric: "tabular-nums" }}>
      {displayCount.toLocaleString()}
    </Text>
  );
}
