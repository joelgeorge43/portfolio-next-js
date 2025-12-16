"use client";

import { useEffect, useState } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";
import { Column, Heading, Text, useTheme } from "@once-ui-system/core";

export default function SchedulerClient() {
    const { theme } = useTheme();
    const [calTheme, setCalTheme] = useState<"dark" | "light">("dark");

    useEffect(() => {
        const root = document.documentElement;
        const dataTheme = root.getAttribute("data-theme");
        if (dataTheme === "dark" || dataTheme === "light") {
            setCalTheme(dataTheme);
        } else {
            // Fallback for system or initial load
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            setCalTheme(systemTheme);
        }
    }, [theme]);

	useEffect(() => {
	  (async function () {
		const cal = await getCalApi({});
		cal("ui", {
            theme: calTheme,
            styles: { 
                branding: { brandColor: "#FFFFFF" },
                body: { background: 'transparent' }
            },
            hideEventTypeDetails: false,
            layout: "month_view",
            cssVarsPerTheme: {
                dark: {
                    "cal-border-booker": "transparent",
                    "cal-bg-muted": "transparent",
                    "cal-bg": "transparent",
                    "cal-bg-emphasis": "transparent",
                    "cal-bg-subtle": "transparent",
                    "cal-text": "#FFFFFF",
                    "cal-text-muted": "#9CA3AF"
                },
                light: {
                    "cal-border-booker": "transparent",
                    "cal-bg-muted": "transparent",
                    "cal-bg": "transparent",
                    "cal-bg-emphasis": "transparent",
                    "cal-bg-subtle": "transparent",
                    "cal-text": "#000000",
                    "cal-text-muted": "#4B5563"
                }
            }
        });
	  })();
	}, [calTheme]);
  
	return (
      <Column
        fillWidth
        paddingY="l"
        paddingX="l"
        horizontal="center"
        align="center"
        position="relative"
      >
        <Column
            zIndex={1}
            fillWidth
            maxWidth="l"
            marginBottom="m"
            horizontal="center"
            align="center"
            position="relative"
        >
             
            <Column horizontal="center" gap="m" fillWidth padding="l">
                <Heading variant="display-strong-l">Let's Connect</Heading>
                <Text variant="body-default-l" onBackground="neutral-weak" marginBottom="l">
                    Schedule a time to discuss your project.
                </Text>
                <Cal 
                    calLink="joelgeorge43/30min"
                    style={{width:"100%", height:"100%", overflow:"hidden", minHeight: "500px"}}
                    config={{layout: 'month_view', theme: calTheme}}
                />
            </Column>
        </Column>
	  </Column>
	);
}
