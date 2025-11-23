
'use client';

import { useInitiatives, useUsers } from "@/lib/data";
import { AppShell } from "@/components/app-shell";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { RAGStatus, User } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useMemo } from "react";

const RAG_MAP: Record<RAGStatus, string> = {
  Red: 'bg-red-500',
  Amber: 'bg-amber-500',
  Green: 'bg-green-500',
};

export default function InitiativesPage() {
    const { data: initiativesData } = useInitiatives();
    const { data: usersData } = useUsers();
    const initiatives = initiativesData || [];
    const users = usersData || [];

    const userMap = useMemo(() => {
        return users.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {} as Record<string, User>);
    }, [users]);
    
    const themes = useMemo(() => {
        return [...new Set(initiatives.map(i => i.category))];
    }, [initiatives]);

    return (
        <AppShell>
            <Header />
            <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Initiatives</h2>
                     <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Initiative
                    </Button>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>All Initiatives</CardTitle>
                        <CardDescription>Browse and manage all strategic initiatives.</CardDescription>
                        <div className="mt-4 flex items-center gap-2">
                            <Input placeholder="Search by name..." className="max-w-sm" />
                            <Select>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by theme" />
                                </SelectTrigger>
                                <SelectContent>
                                    {themes.map(theme => <SelectItem key={theme} value={theme}>{theme}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Not Started">Not Started</SelectItem>
                                    <SelectItem value="On Hold">On Hold</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>RAG</TableHead>
                                    <TableHead>Initiative Name</TableHead>
                                    <TableHead>Theme</TableHead>
                                    <TableHead>Lead(s)</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>End Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {initiatives.map(initiative => (
                                    <TableRow key={initiative.id}>
                                        <TableCell>
                                            <div className={cn("h-2.5 w-2.5 rounded-full", RAG_MAP[initiative.ragStatus])} />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                          <Link href={`/initiatives/${initiative.id}`} className="hover:underline">{initiative.name}</Link>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{initiative.category}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex -space-x-2 overflow-hidden">
                                                {initiative.leadIds.map(leadId => (
                                                    <Avatar key={leadId} className="h-6 w-6 border-2 border-card">
                                                        <AvatarImage src={userMap[leadId]?.photoUrl} />
                                                        <AvatarFallback>{userMap[leadId]?.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={initiative.status === 'Completed' ? 'default' : 'outline'}>{initiative.status}</Badge>
                                        </TableCell>
                                        <TableCell>{initiative.priority}</TableCell>
                                        <TableCell>{format(new Date(initiative.endDate), "MM/dd/yyyy")}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem asChild><Link href={`/initiatives/${initiative.id}`}>View Details</Link></DropdownMenuItem>
                                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </AppShell>
    )
}
