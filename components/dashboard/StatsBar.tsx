import { Card, CardContent } from "@/components/ui/card";

interface StatsBarProps {
  total: number;
  active: number;
  completed: number;
  dropped: number;
}

export default function StatsBar({
  total,
  active,
  completed,
  dropped,
}: StatsBarProps) {
  const stats = [
    { label: "Total Students", value: total, color: "text-foreground" },
    { label: "Active", value: active, color: "text-green-600" },
    { label: "Completed", value: completed, color: "text-blue-600" },
    { label: "Dropped", value: dropped, color: "text-destructive" },
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
