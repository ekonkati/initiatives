import { AppShell } from "@/components/app-shell";
import { Header } from "@/components/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getInitiative, getTasksForInitiative, getUser, getUsers, getAttachments } from "@/lib/data";
import { RAGStatus, Task, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, File, GanttChartSquare, Star, Upload, Users as UsersIcon, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const RAG_MAP: Record<RAGStatus, string> = {
  Red: 'border-red-500 text-red-500',
  Amber: 'border-amber-500 text-amber-500',
  Green: 'border-green-500 text-green-500',
};

export default function InitiativeDetailPage({ params }: { params: { id: string } }) {
    const initiative = getInitiative(params.id);
    if (!initiative) {
        notFound();
    }

    const allUsers = getUsers();
    const userMap = allUsers.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
    }, {} as Record<string, User>);

    const tasks = getTasksForInitiative(initiative.id);
    const attachments = getAttachments(initiative.id);

    return (
        <AppShell>
            <Header />
            <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
                <div className="flex items-center gap-4">
                  <Link href="/initiatives">
                    <Button variant="outline" size="icon" className="h-7 w-7">
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                    </Button>
                  </Link>
                  <h2 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                    {initiative.name}
                    <Badge variant="secondary">{initiative.theme}</Badge>
                  </h2>
                </div>
                
                <Tabs defaultValue="overview">
                    <TabsList className="mb-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="tasks">Tasks</TabsTrigger>
                        <TabsTrigger value="documents">Documents</TabsTrigger>
                        <TabsTrigger value="ratings">Ratings</TabsTrigger>
                        <TabsTrigger value="activity">Activity Log</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview">
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="md:col-span-2 space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <h3 className="font-medium">Description</h3>
                                            <p className="text-muted-foreground">{initiative.description}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-medium">Objectives</h3>
                                            <p className="text-muted-foreground">{initiative.objectives}</p>
                                        </div>
                                        <div className="flex items-center pt-2">
                                            <Progress value={initiative.progress} className="w-full" />
                                            <span className="ml-4 font-semibold">{initiative.progress}%</span>
                                        </div>
                                    </CardContent>
                                </Card>
                                 <Card>
                                    <CardHeader>
                                        <CardTitle>Team</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <h4 className="text-sm font-semibold mb-2">Leads</h4>
                                        <div className="flex gap-4 mb-4">
                                            {initiative.leads.map(id => userMap[id] && <UserAvatar user={userMap[id]} key={id} />)}
                                        </div>
                                        <h4 className="text-sm font-semibold mb-2">Core Team</h4>
                                        <div className="flex flex-wrap gap-4">
                                            {initiative.teamMembers.map(id => userMap[id] && <UserAvatar user={userMap[id]} key={id} />)}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="space-y-6">
                               <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Status</CardTitle>
                                        <GanttChartSquare className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{initiative.status}</div>
                                        <Badge variant="outline" className={cn("mt-2 text-sm", RAG_MAP[initiative.ragStatus])}>
                                            {initiative.ragStatus}
                                        </Badge>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Timeline</CardTitle>
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">Start: {new Date(initiative.startDate).toLocaleDateString()}</p>
                                        <p className="text-sm text-muted-foreground">End: {new Date(initiative.targetEndDate).toLocaleDateString()}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Overall Rating</CardTitle>
                                        <Star className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">4.5 <span className="text-sm text-muted-foreground">/ 5</span></div>
                                        <p className="text-xs text-muted-foreground">Based on 2 reviews</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                     <TabsContent value="tasks">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tasks</CardTitle>
                                <CardDescription>All tasks associated with this initiative.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Task</TableHead>
                                            <TableHead>Owner</TableHead>
                                            <TableHead>Due Date</TableHead>
                                            <TableHead>Progress</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tasks.map(task => (
                                            <TableRow key={task.id}>
                                                <TableCell><Badge variant="outline">{task.status}</Badge></TableCell>
                                                <TableCell className="font-medium">{task.title}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6">
                                                          <AvatarImage src={userMap[task.ownerId]?.avatarUrl} />
                                                          <AvatarFallback>{userMap[task.ownerId]?.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <span>{userMap[task.ownerId]?.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                                                <TableCell><Progress value={task.progress} className="h-2" /></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="documents">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Documents</CardTitle>
                                    <CardDescription>Files and documents attached to this initiative.</CardDescription>
                                </div>
                                <Button><Upload className="mr-2 h-4 w-4" /> Attach File</Button>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {attachments.map(att => (
                                        <li key={att.id} className="flex items-center justify-between rounded-md border p-3">
                                            <div className="flex items-center gap-3">
                                                <File className="h-6 w-6 text-muted-foreground" />
                                                <div>
                                                    <a href={att.driveUrl} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">{att.fileName}</a>
                                                    <p className="text-sm text-muted-foreground">Uploaded by {userMap[att.uploadedBy]?.name} on {new Date(att.uploadedAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline">{att.fileType}</Badge>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="ratings">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Initiative Ratings</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <RatingChart />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Team Member Ratings</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {/* Team member rating list */}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </AppShell>
    );
}

const UserAvatar = ({ user }: { user: User }) => (
    <div className="flex items-center gap-2">
        <Avatar>
            <AvatarImage src={user.avatarUrl} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.designation}</p>
        </div>
    </div>
);

const chartData = [
  { name: 'Impact', score: 4.8 },
  { name: 'Timeliness', score: 4.2 },
  { name: 'Execution', score: 4.9 },
  { name: 'Collaboration', score: 4.5 },
]

function RatingChart() {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" domain={[0, 5]} hide />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 4, 4]} />
            </BarChart>
        </ResponsiveContainer>
    )
}
