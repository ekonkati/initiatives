'use client';

import { Header } from "@/components/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInitiatives, useTasksForUser, useUser } from "@/lib/data";
import { Initiative, RAGStatus, Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Building, ChevronLeft, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useMemo } from "react";

const RAG_MAP: Record<RAGStatus, string> = {
  Red: 'bg-red-500',
  Amber: 'bg-amber-500',
  Green: 'bg-green-500',
};

export default function PersonDetailPage() {
    const params = useParams();
    const id = params.id as string;
    
    const { data: user, isLoading: isLoadingUser } = useUser(id);
    const { data: allInitiatives, isLoading: isLoadingInitiatives } = useInitiatives();
    const { data: tasks, isLoading: isLoadingTasks } = useTasksForUser(id);

    const userInitiatives = useMemo(() => {
        if (!allInitiatives || !user) return [];
        return allInitiatives.filter(
            i => i.leadIds.includes(user.id) || i.teamMemberIds.includes(user.id)
        );
    }, [allInitiatives, user]);

    if (isLoadingUser || isLoadingInitiatives || isLoadingTasks) {
        return (
             <>
                <Header />
                <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
                    <div>Loading...</div>
                </main>
            </>
        );
    }
    
    if (!user) {
        notFound();
    }


    return (
        <>
            <Header />
            <main className="flex-1 space-y-6 p-4 pt-6 md:p-8">
                 <div className="flex items-center gap-4">
                  <Link href="/people">
                    <Button variant="outline" size="icon" className="h-7 w-7">
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                    </Button>
                  </Link>
                  <h2 className="flex-1 text-3xl font-bold tracking-tight">User Profile</h2>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    <div className="lg:col-span-1">
                        <Card className="flex flex-col items-center p-6 text-center">
                            <Avatar className="h-24 w-24 mb-4">
                                <AvatarImage src={user.photoUrl} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <h3 className="text-xl font-bold">{user.name}</h3>
                            <p className="text-muted-foreground">{user.designation}</p>
                            <Badge className="mt-2">{user.role}</Badge>
                            <div className="mt-4 flex w-full justify-center gap-2">
                                <Button variant="outline" size="icon">
                                    <Mail className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon">
                                    <Phone className="h-4 w-4" />
                                </Button>
                            </div>
                        </Card>
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="text-lg">Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <Building className="h-4 w-4 text-muted-foreground" />
                                    <span>{user.department}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{user.email}</span>
                                </div>
                                 <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>+1 234 567 890</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-3 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Active Initiatives ({userInitiatives.length})</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                {userInitiatives.map(initiative => (
                                    <InitiativeCard key={initiative.id} initiative={initiative} />
                                ))}
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle>Assigned Tasks ({tasks?.length || 0})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                {tasks?.map(task => (
                                    <TaskItem key={task.id} task={task} />
                                ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </>
    )
}

function InitiativeCard({ initiative }: { initiative: Initiative }) {
    return (
        <Link href={`/initiatives/${initiative.id}`} className="block rounded-lg border bg-card p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <h4 className="font-semibold">{initiative.name}</h4>
                <div className={cn("h-2.5 w-2.5 rounded-full mt-1", RAG_MAP[initiative.ragStatus])} />
            </div>
            <p className="text-sm text-muted-foreground mt-1">{initiative.category}</p>
            <div className="flex items-center justify-between text-sm mt-2">
                <Badge variant="outline">{initiative.status}</Badge>
                <span>{initiative.progress}%</span>
            </div>
        </Link>
    )
}


function TaskItem({ task }: { task: Task }) {
    return (
        <li className="flex items-center justify-between rounded-md border p-3">
            <div>
                <p className="font-medium">{task.title}</p>
                <p className="text-sm text-muted-foreground">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
            </div>
             <Badge variant={task.status === 'Completed' ? 'default' : 'outline'}>{task.status}</Badge>
        </li>
    )
}
