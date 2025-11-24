
'use client';

import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useInitiatives, useUsers } from "@/lib/data";
import { Activity, Briefcase, CheckCircle, Users } from "lucide-react";
import { Initiative, User } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


export default function DashboardPage() {
    const { data: initiativesData, isLoading: isLoadingInitiatives } = useInitiatives();
    const { data: usersData, isLoading: isLoadingUsers } = useUsers();

    const initiatives = initiativesData || [];
    const users = usersData || [];

    const userMap = useMemo(() => {
        if (!users) return {};
        return users.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {} as Record<string, User>);
    }, [users]);
    
    const stats = useMemo(() => {
        const active = initiatives.filter(i => i.status === 'In Progress').length;
        const completed = initiatives.filter(i => i.status === 'Completed').length;
        return {
            total: initiatives.length,
            active,
            completed,
            users: users.length,
        }
    }, [initiatives, users]);

    const chartData = useMemo(() => {
        const statusCounts: Record<string, number> = {};
        initiatives.forEach(i => {
            statusCounts[i.status] = (statusCounts[i.status] || 0) + 1;
        });
        return Object.entries(statusCounts).map(([name, value]) => ({ name, count: value }));
    }, [initiatives]);


    if (isLoadingInitiatives || isLoadingUsers) {
        return (
            <>
                <Header />
                <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">Loading dashboard...</div>
            </>
        )
    }

  return (
    <>
        <Header/>
        <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Initiatives</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">Across all departments</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Initiatives</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.active}</div>
                        <p className="text-xs text-muted-foreground">Currently in progress</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed Initiatives</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completed}</div>
                        <p className="text-xs text-muted-foreground">Successfully delivered</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.users}</div>
                        <p className="text-xs text-muted-foreground">Involved in initiatives</p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Initiatives</CardTitle>
                        <CardDescription>A view of the latest initiatives added.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Initiative Name</TableHead>
                                    <TableHead>Theme</TableHead>
                                    <TableHead>Lead(s)</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {initiatives.slice(0, 5).map(initiative => (
                                    <TableRow key={initiative.id}>
                                        <TableCell className="font-medium">
                                            <Link href={`/initiatives/${initiative.id}`} className="hover:underline">{initiative.name}</Link>
                                        </TableCell>
                                        <TableCell><Badge variant="secondary">{initiative.category}</Badge></TableCell>
                                        <TableCell>
                                             <div className="flex -space-x-2 overflow-hidden">
                                                {initiative.leadIds.map(leadId => (
                                                    userMap[leadId] &&
                                                    <Avatar key={leadId} className="h-6 w-6 border-2 border-card">
                                                        <AvatarImage src={userMap[leadId]?.photoUrl} />
                                                        <AvatarFallback>{userMap[leadId]?.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell><Badge variant={initiative.status === 'Completed' ? 'default' : 'outline'}>{initiative.status}</Badge></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Initiatives by Status</CardTitle>
                        <CardDescription>A breakdown of all initiatives.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" fontSize={12} />
                                <YAxis />
                                <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--background))'}}/>
                                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}/>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </main>
    </>
  );
}
