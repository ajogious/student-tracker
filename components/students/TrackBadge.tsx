import { Badge } from "@/components/ui/badge";
import { TrackType } from "@prisma/client";

const trackConfig: Record<TrackType, { label: string }> = {
  FAST_TRACK: { label: "Fast Track" },
  NORMAL_TRACK: { label: "Normal Track" },
  SHORT_COURSE: { label: "Short Course" },
};

export default function TrackBadge({ track }: { track: TrackType }) {
  return (
    <Badge variant="outline" className="font-normal">
      {trackConfig[track].label}
    </Badge>
  );
}
