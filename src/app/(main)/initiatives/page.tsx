
'use client';

import { useInitiatives, useUsers } from "@/lib/data";
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
import { RAGStatus, User, Initiative, InitiativeStatus } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { InitiativeFormDialog } from "@/components/initiative-form-dialog";
import { useFirestore, useUser as useAuthUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useSearchParams } from "next/navigation";

const RAG_MAP: Record<RAGStatus, string> = {
  Red: 'bg-red-500',
  Amber: 'bg-amber-500',
  Green: 'bg-green-500',
};

export default function InitiativesPage() {
    const searchParams = useSearchParams();
    const { data: initiativesData, isLoading: isLoadingInitiatives } = useInitiatives();
    const { data: usersData, isLoading: isLoadingUsers } = useUsers();
    const { user: authUser } = useAuthUser();
    const { toast } = useToast();
    const firestore = useFirestore();

    const [isCreateFormOpen, setCreateFormOpen] = useState(false);
    
    // State for filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTheme, setSelectedTheme] = useState(searchParams.get('category') || 'all');
    const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all');

    const allInitiatives = initiativesData || [];
    const users = usersData || [];

    const userMap = useMemo(() => {
        if (!users) return {};
        return users.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {} as Record<string, User>);
    }, [users]);
    
    const themes = useMemo(() => {
        if (!allInitiatives) return [];
        return [...new Set(allInitiatives.map(i => i.category))];
    }, [allInitiatives]);
    
    const filteredInitiatives = useMemo(() => {
        return (allInitiatives || []).filter(initiative => {
            const nameMatch = initiative.name.toLowerCase().includes(searchTerm.toLowerCase());
            const themeMatch = selectedTheme === 'all' || initiative.category === selectedTheme;
            const statusMatch = selectedStatus === 'all' || initiative.status === selectedStatus;
            return nameMatch && themeMatch && statusMatch;
        });
    }, [allInitiatives, searchTerm, selectedTheme, selectedStatus]);

    const onInitiativeCreate = async (values: any) => {
        if (!firestore || !authUser) return;

        try {
            await addDoc(collection(firestore, 'initiatives'), {
                ...values,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                ragStatus: 'Green',
                progress: 0,
                tags: [],
            });
            toast({ title: "Initiative created successfully!" });
            setCreateFormOpen(false);
        } catch (error) {
            console.error("Error creating initiative:", error);
            toast({ title: "Error", description: "Failed to create initiative.", variant: "destructive" });
        }
    };
    
    if (isLoadingInitiatives || isLoadingUsers) {
        return (
            <>
                <Header />
                <main className="flex-1 flex items-center justify-center p-4">
                  <div className="rounded-md border bg-card px-6 py-3 text-lg font-semibold shadow-sm">Loading...</div>
                </main>
            </>
        )
    }

    return (
        <>
            <Header />
            <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Initiatives</h2>
                     <Button onClick={() => setCreateFormOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Initiative
                    </Button>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Your Initiatives</CardTitle>
                        <CardDescription>Browse and manage strategic initiatives you are part of.</CardDescription>
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            <Input 
                                placeholder="Search by name..." 
                                className="max-w-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Filter by theme" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Themes</SelectItem>
                                    {themes.map(theme => <SelectItem key={theme} value={theme}>{theme}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    {Object.values(InitiativeStatus).map(status => (
                                        <SelectItem key={status} value={status}>{status}</SelectItem>
                                    ))}
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
                                {filteredInitiatives.map(initiative => (
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
                                                    userMap[leadId] &&
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

                {usersData && (
                    <InitiativeFormDialog
                        key={isCreateFormOpen ? 'create-new' : 'closed'}
                        open={isCreateFormOpen}
                        onOpenChange={setCreateFormOpen}
                        onSubmit={onInitiativeCreate}
                        users={users}
                        allInitiatives={allInitiatives}
                    />
                )}
            </main>
        </>
    )
}
