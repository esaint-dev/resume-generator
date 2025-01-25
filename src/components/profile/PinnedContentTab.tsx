import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PinnedContentTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pinned Content</CardTitle>
        <CardDescription>
          Highlight your important content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Pinned content feature coming soon...
        </p>
      </CardContent>
    </Card>
  );
}