import { Card, CardContent } from "@/components/ui/card";

interface StatsBarProps {
  total: number;
  active: number;
  completed: number;
  examsThisMonth: number;
}

export default function StatsBar({
  total,
  active,
  completed,
  examsThisMonth,
}: StatsBarProps) {
  const stats = [
    { label: "Total Students", value: total, color: "text-foreground" },
    { label: "Active", value: active, color: "text-green-600 dark:text-green-400" },
    { label: "Completed", value: completed, color: "text-blue-600 dark:text-blue-400" },
    { label: "Exams This Month", value: examsThisMonth, color: "text-indigo-600 dark:text-indigo-400" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 ${stat.color}`}>
              {stat.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
