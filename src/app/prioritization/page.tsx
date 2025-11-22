import { AppShell } from "@/components/app-shell";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getInitiatives } from "@/lib/data";
import { GripVertical, Merge } from "lucide-react";

export default function PrioritizationPage() {
    const initiatives = getInitiatives();
    const priority1 = initiatives.filter(i => i.priority === 'High' && i.status === 'In Progress');
    const priority2 = initiatives.filter(i => i.priority === 'Medium' && i.status === 'In Progress');
    const priority3 = initiatives.filter(i => i.priority === 'Low' || i.status === 'Not Started');

    return (
        <AppShell>
            <Header />
            <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Prioritization Board</h2>
                     <Button>
                        <Merge className="mr-2 h-4 w-4" />
                        Merge Initiatives
                    </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    <PriorityColumn title="Priority 1 - Immediate" initiatives={priority1} />
                    <PriorityColumn title="Priority 2 - Next" initiatives={priority2} />
                    <PriorityColumn title="Priority 3 - Long Term" initiatives={priority3} />
                </div>
            </main>
        </AppShell>
    )
}


function PriorityColumn({ title, initiatives }: { title: string, initiatives: ReturnType<typeof getInitiatives> }) {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {initiatives.map(initiative => (
                    <Card key={initiative.id} className="p-3 flex items-start gap-3">
                        <GripVertical className="h-5 w-5 mt-1 text-muted-foreground cursor-grab" />
                        <div className="flex-1">
                            <p className="font-medium">{initiative.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary">{initiative.theme}</Badge>
                                <Badge variant="outline">{initiative.priority} Priority</Badge>
                            </div>
                        </div>
                    </Card>
                ))}
            </CardContent>
        </Card>
    )
}
