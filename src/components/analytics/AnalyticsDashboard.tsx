"use client";

import { useEffect, useState } from "react";
import { Column, Row, Heading, Text, Spinner } from "@once-ui-system/core";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsData {
  totalVisitors: number;
  totalPageViews: number;
  countryStats: Array<{ country: string; count: number }>;
  deviceStats: Array<{ device: string; count: number }>;
  browserStats: Array<{ browser: string; count: number }>;
  popularPages: Array<{ path: string; title: string; views: number }>;
  timeSeries: Array<{ date: string; views: number }>;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics/stats");
      if (res.ok) {
        const analyticsData = await res.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Column fillWidth center padding="xl">
        <Spinner />
      </Column>
    );
  }

  if (!data) {
    return (
      <Column fillWidth center padding="xl">
        <Text>Failed to load analytics data</Text>
      </Column>
    );
  }

  return (
    <Column fillWidth gap="xl" padding="l">
      <Heading variant="heading-strong-l">Analytics Dashboard</Heading>

      {/* Key Metrics */}
      <Row fillWidth gap="m" wrap>
        <Column
          background="surface"
          padding="l"
          radius="l"
          border="neutral-alpha-weak"
          style={{ flex: 1, minWidth: "250px" }}
        >
          <Text variant="label-default-s" onBackground="neutral-weak">
            Total Visitors
          </Text>
          <Heading variant="heading-strong-xl">{data.totalVisitors}</Heading>
        </Column>
        <Column
          background="surface"
          padding="l"
          radius="l"
          border="neutral-alpha-weak"
          style={{ flex: 1, minWidth: "250px" }}
        >
          <Text variant="label-default-s" onBackground="neutral-weak">
            Total Page Views
          </Text>
          <Heading variant="heading-strong-xl">{data.totalPageViews}</Heading>
        </Column>
      </Row>

      {/* Time Series Chart */}
      <Column background="surface" padding="l" radius="l" border="neutral-alpha-weak" gap="m">
        <Heading variant="heading-strong-s">Visitor Trends (Last 30 Days)</Heading>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.timeSeries}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="views" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Column>

      {/* Device & Browser Stats */}
      <Row fillWidth gap="m" wrap>
        {/* Device Breakdown */}
        <Column
          background="surface"
          padding="l"
          radius="l"
          border="neutral-alpha-weak"
          gap="m"
          style={{ flex: 1, minWidth: "300px" }}
        >
          <Heading variant="heading-strong-s">Device Types</Heading>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.deviceStats}
                dataKey="count"
                nameKey="device"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {data.deviceStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Column>

        {/* Browser Breakdown */}
        <Column
          background="surface"
          padding="l"
          radius="l"
          border="neutral-alpha-weak"
          gap="m"
          style={{ flex: 1, minWidth: "300px" }}
        >
          <Heading variant="heading-strong-s">Browsers</Heading>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.browserStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="browser" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Column>
      </Row>

      {/* Country Stats */}
      <Column background="surface" padding="l" radius="l" border="neutral-alpha-weak" gap="m">
        <Heading variant="heading-strong-s">Visitors by Country</Heading>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.countryStats.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="country" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </Column>

      {/* Popular Pages */}
      <Column background="surface" padding="l" radius="l" border="neutral-alpha-weak" gap="m">
        <Heading variant="heading-strong-s">Popular Pages</Heading>
        <Column gap="s">
          {data.popularPages.map((page, index) => (
            <Row
              key={index}
              fillWidth
              horizontal="between"
              padding="s"
              background="neutral-alpha-weak"
              radius="m"
            >
              <Column gap="xs">
                <Text variant="body-default-s">{page.title || page.path}</Text>
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  {page.path}
                </Text>
              </Column>
              <Text variant="heading-strong-s">{page.views}</Text>
            </Row>
          ))}
        </Column>
      </Column>
    </Column>
  );
}
