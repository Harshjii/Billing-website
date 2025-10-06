import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEndedSessions } from "@/hooks/useEndedSessions";

export const RevenueChart = () => {
  const { endedSessions } = useEndedSessions();

  // Group sessions by day for chart
  const sessionsByDay = endedSessions.reduce((acc, session) => {
    const day = new Date(session.endTimestamp).toLocaleDateString('en-US', { weekday: 'short' });
    if (!acc[day]) {
      acc[day] = { revenue: 0, customers: 0 };
    }
    acc[day].revenue += session.totalAmount;
    acc[day].customers += 1;
    return acc;
  }, {} as Record<string, { revenue: number; customers: number }>);

  const data = Object.entries(sessionsByDay).map(([day, data]) => ({
    day,
    revenue: data.revenue,
    customers: data.customers
  }));

  // If no data, show empty chart with days
  const emptyData = [
    { day: "Mon", revenue: 0 },
    { day: "Tue", revenue: 0 },
    { day: "Wed", revenue: 0 },
    { day: "Thu", revenue: 0 },
    { day: "Fri", revenue: 0 },
    { day: "Sat", revenue: 0 },
    { day: "Sun", revenue: 0 },
  ];

  const chartData = data.length > 0 ? data : emptyData;

  return (
    <div className="h-[250px] sm:h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
          <YAxis stroke="hsl(var(--muted-foreground))" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              color: "hsl(var(--foreground))",
            }}
            formatter={(value, name) => [
              name === 'revenue' ? `₹${value}` : value,
              name === 'revenue' ? 'Revenue' : 'Customers'
            ]}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="hsl(var(--accent))"
            strokeWidth={3}
            dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 5 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
