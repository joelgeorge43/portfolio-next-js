"use client";

import { mailchimp, newsletter } from "@/resources";
import { Button, Heading, Input, Text, Background, Column, Row, Textarea } from "@once-ui-system/core";
import { opacity, SpacingToken } from "@once-ui-system/core";
import { useState } from "react";

export const Contact: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorDetails, setErrorDetails] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted", formData);
    setStatus("submitting");
    setErrorDetails("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("API Response status:", response.status);

      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        const data = await response.json();
        console.error("API Error data:", data);
        setStatus("error");
        setErrorDetails(data.error || "Something went wrong");
        alert(`Error: ${data.error || "Something went wrong"}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      setStatus("error");
      setErrorDetails("Failed to send message");
      alert("Error: Failed to send message. Please check your connection.");
    }
  };

  if (newsletter.display === false) return null;

  return (
    <Column
      overflow="hidden"
      fillWidth
      padding="xl"
      radius="l"
      marginBottom="m"
      horizontal="center"
      align="center"
      background="surface"
      border="neutral-alpha-weak"
      {...flex}
    >
      <Background
        top="0"
        position="absolute"
        mask={{
          x: mailchimp.effects.mask.x,
          y: mailchimp.effects.mask.y,
          radius: mailchimp.effects.mask.radius,
          cursor: mailchimp.effects.mask.cursor,
        }}
        gradient={{
          display: mailchimp.effects.gradient.display,
          opacity: mailchimp.effects.gradient.opacity as opacity,
          x: mailchimp.effects.gradient.x,
          y: mailchimp.effects.gradient.y,
          width: mailchimp.effects.gradient.width,
          height: mailchimp.effects.gradient.height,
          tilt: mailchimp.effects.gradient.tilt,
          colorStart: mailchimp.effects.gradient.colorStart,
          colorEnd: mailchimp.effects.gradient.colorEnd,
        }}
        dots={{
          display: mailchimp.effects.dots.display,
          opacity: mailchimp.effects.dots.opacity as opacity,
          size: mailchimp.effects.dots.size as SpacingToken,
          color: mailchimp.effects.dots.color,
        }}
        grid={{
          display: mailchimp.effects.grid.display,
          opacity: mailchimp.effects.grid.opacity as opacity,
          color: mailchimp.effects.grid.color,
          width: mailchimp.effects.grid.width,
          height: mailchimp.effects.grid.height,
        }}
        lines={{
          display: mailchimp.effects.lines.display,
          opacity: mailchimp.effects.lines.opacity as opacity,
          size: mailchimp.effects.lines.size as SpacingToken,
          thickness: mailchimp.effects.lines.thickness,
          angle: mailchimp.effects.lines.angle,
          color: mailchimp.effects.lines.color,
        }}
      />
      <Column maxWidth="s" horizontal="center">
        <Heading marginBottom="s" variant="display-strong-xs">
          {newsletter.title}
        </Heading>
        <Text wrap="balance" marginBottom="l" variant="body-default-l" onBackground="neutral-weak">
          {newsletter.description}
        </Text>
      </Column>
      
      {status === "success" ? (
        <Column horizontal="center" gap="m">
            <Heading as="h3" variant="heading-strong-m">Message Sent!</Heading>
            <Text>Thank you for reaching out. I'll get back to you soon.</Text>
            <Button onClick={() => setStatus("idle")}>Send another</Button>
        </Column>
      ) : (
        <form
            style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            }}
            onSubmit={handleSubmit}
        >
            <Column
            fillWidth
            maxWidth="s"
            gap="16"
            >
             <Row gap="16" s={{ direction: "column" }}>
                <Input
                    id="name"
                    name="name"
                    label="Your Name"
                    placeholder="John Doe"
                    required
                    value={formData.name}
                    onChange={handleChange}
                />
                <Input
                    id="email"
                    name="email"
                    type="email"
                    label="Your Email"
                    placeholder="john@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                />
             </Row>
             <Input
                id="subject"
                name="subject"
                label="Subject"
                placeholder="Project Inquiry"
                required
                value={formData.subject}
                onChange={handleChange}
             />
             <Textarea
                id="message"
                name="message"
                label="Message"
                placeholder="Tell me about your project..."
                required
                rows={4}
                value={formData.message}
                onChange={handleChange}
             />

            <Button size="l" fillWidth loading={status === "submitting"} type="submit">
                Send Enquiry
            </Button>
            {status === "error" && (
                <Text variant="body-default-s" onBackground="danger-weak">
                    {errorDetails}
                </Text>
            )}
            </Column>
        </form>
      )}
    </Column>
  );
};
