"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Generate a simple visitor fingerprint based on browser characteristics
function generateVisitorId(): string {
  if (typeof window === "undefined") return "";
  
  // Check if we already have a visitor ID in localStorage
  const stored = localStorage.getItem("visitor_id");
  if (stored) return stored;
  
  // Generate a new fingerprint
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage,
  ].join("|");
  
  // Create a simple hash
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const visitorId = `visitor_${Math.abs(hash)}_${Date.now()}`;
  localStorage.setItem("visitor_id", visitorId);
  return visitorId;
}

// Get device type
function getDeviceType(): string {
  if (typeof window === "undefined") return "unknown";
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

// Get browser name
function getBrowser(): string {
  if (typeof window === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Edge")) return "Edge";
  return "Other";
}

// Get OS
function getOS(): string {
  if (typeof window === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (ua.includes("Win")) return "Windows";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iOS")) return "iOS";
  return "Other";
}

export function useAnalytics() {
  const pathname = usePathname();
  const startTimeRef = useRef<number>(Date.now());
  const previousPathRef = useRef<string>("");

  useEffect(() => {
    // Track page view
    const trackPageView = async () => {
      const visitorId = generateVisitorId();
      if (!visitorId) return;

      const data = {
        visitorId,
        pagePath: pathname,
        pageTitle: document.title,
        deviceType: getDeviceType(),
        browser: getBrowser(),
        os: getOS(),
        referrer: document.referrer || "direct",
      };

      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } catch (error) {
        console.error("Analytics tracking error:", error);
      }
    };

    // Track duration on previous page
    const trackDuration = async () => {
      if (previousPathRef.current && previousPathRef.current !== pathname) {
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const visitorId = generateVisitorId();
        
        try {
          await fetch("/api/analytics/duration", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              visitorId,
              pagePath: previousPathRef.current,
              duration,
            }),
          });
        } catch (error) {
          console.error("Duration tracking error:", error);
        }
      }
    };

    trackDuration();
    trackPageView();
    
    startTimeRef.current = Date.now();
    previousPathRef.current = pathname;
  }, [pathname]);

  // Track duration on page unload
  useEffect(() => {
    const handleBeforeUnload = async () => {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const visitorId = generateVisitorId();
      
      if (navigator.sendBeacon) {
        const data = JSON.stringify({
          visitorId,
          pagePath: pathname,
          duration,
        });
        navigator.sendBeacon("/api/analytics/duration", data);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [pathname]);
}
