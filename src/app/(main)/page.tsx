'use client';

import {
  Activity,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  MoreVertical,
  PlusCircle,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

import { Header } from '@/components/header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useInitiatives, useTasksForUser, useUser, useUsers } from '@/lib/data';
import { type Task, type User, type Initiative, RAGStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { useUser as useAuthUser } from '@/firebase';
import { InitiativeFormDialog } from '@/components/initiative-form-dialog';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';


const RAG_MAP: Record<RAGStatus, string> = {
  Red: 'bg-red-500',
  Amber: 'bg-amber-500',
  Green: 'bg-green-500',
};

export default function DashboardPage() {
  const { user: authUser, isUserLoading } = useAuthUser();
  const { data: currentUser } = useUser(authUser?.uid); 
  const { data: allInitiativesData, isLoading: isLoadingInitiatives } = useInitiatives();
  const { data: myTasksData, isLoading: isLoadingTasks } = useTasksForUser(currentUser?.id);
  const { data: allUsersData, isLoading: isLoadingUsers } = useUsers();
  
  const [isCreateFormOpen, setCreateFormOpen] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const myInitiatives = useMemo(() => {
    if (!allInitiativesData || !currentUser) return [];
    return allInitiativesData.filter(
        (i) => i.leadIds.includes(currentUser.id) || i.teamMemberIds.includes(currentUser.id)
    );
  }, [allInitiativesData, currentUser]);
  
  const myTasks = myTasksData || [];

  const userMap = useMemo(() => {
    if (!allUsersData) return {};
    return allUsersData.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
    }, {} as Record<string, User>);
    }, [allUsersData]);

  const onInitiativeCreate = async (values: any) => {
    if (!firestore || !authUser) return;

    try {
        const docRef = await addDoc(collection(firestore, 'initiatives'), {
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


  if (isUserLoading || isLoadingTasks || isLoadingUsers || isLoadingInitiatives) {
    return (
        <>
            <Header />
            <main className="flex-1 p-4 pt-6 md:p-8">
                <div>Loading...</div>
            </main>
        </>
    );
  }

  if (!currentUser) return (
      <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-center h-full">
            <p>Please <Link href="/login" className="underline">log in</Link> to see your dashboard.</p>
        </div>
      </main>
  );

  const stats = {
    totalInitiatives: myInitiatives.length,
    completedTasks: myTasks.filter((t) => t.status === 'Completed').length,
    activeTasks: myTasks.filter((t) => t.status === 'In Progress').length,
    overdueTasks: myTasks.filter(
      (t) => new Date(t.dueDate) < new Date() && t.status !== 'Completed'
    ).length,
  };

  return (
    <>
      <Header />
      <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Welcome back, {currentUser.name.split(' ')[0]}!</h2>
          <div className="flex items-center space-x-2">
            <Button onClick={() => setCreateFormOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Initiative
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="My Initiatives" value={stats.totalInitiatives.toString()} icon={<Briefcase />} />
          <StatCard title="Completed Tasks" value={stats.completedTasks.toString()} icon={<CheckCircle2 />} />
          <StatCard title="Active Tasks" value={stats.activeTasks.toString()} icon={<Activity />} />
          <StatCard title="Overdue Tasks" value={stats.overdueTasks.toString()} icon={<TrendingUp />} isNegative />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="grid gap-2">
                <CardTitle>My Initiatives</CardTitle>
                <CardDescription>An overview of initiatives you are a part of.</CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href="/initiatives">
                  View All
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="grid gap-6">
              {myInitiatives.slice(0, 4).map((initiative) => (
                <div key={initiative.id} className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-4">
                    <div className={cn('h-2.5 w-2.5 rounded-full', RAG_MAP[initiative.ragStatus])} />
                    <div>
                      <p className="font-medium leading-none">
                        <Link href={`/initiatives/${initiative.id}`} className="hover:underline">
                          {initiative.name}
                        </Link>
                      </p>
                      <p className="text-sm text-muted-foreground">{initiative.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex -space-x-2 overflow-hidden">
                      {initiative.teamMemberIds.slice(0, 3).map((memberId) => (
                        userMap[memberId] &&
                        <Avatar key={memberId} className="h-6 w-6 border-2 border-card">
                          <AvatarImage src={userMap[memberId]?.photoUrl} />
                          <AvatarFallback>{userMap[memberId]?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <div className="w-24">
                       <Progress value={initiative.progress} className="h-2" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">{initiative.progress}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Daily Check-in</CardTitle>
              <CardDescription>Quick updates for initiatives you lead.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
               {myInitiatives.filter(i => i.leadIds.includes(currentUser.id)).slice(0,3).map(initiative => (
                  <div key={initiative.id} className="flex items-center justify-between">
                    <span className="font-medium">{initiative.name}</span>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8 border-green-500 text-green-500 hover:bg-green-100 hover:text-green-600">G</Button>
                      <Button variant="outline" size="icon" className="h-8 w-8 border-amber-500 text-amber-500 hover:bg-amber-100 hover:text-amber-600">A</Button>
                      <Button variant="outline" size="icon" className="h-8 w-8 border-red-500 text-red-500 hover:bg-red-100 hover:text-red-600">R</Button>
                    </div>
                  </div>
               ))}
               <Button className="w-full mt-2">Submit Updates</Button>
            </CardContent>
          </Card>
        </div>


        <Card>
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
            <CardDescription>Tasks assigned to you across all initiatives.</CardDescription>
          </CardHeader>
          <CardContent>
            <TaskTable tasks={myTasks.slice(0, 5)} initiatives={allInitiativesData || []}/>
          </CardContent>
          <CardFooter className="justify-center border-t p-4">
            <Button size="sm" variant="ghost" className="w-full">
              View All Tasks
            </Button>
          </CardFooter>
        </Card>
        {allUsersData && (
        <InitiativeFormDialog
            key={isCreateFormOpen ? 'create-new' : 'closed'}
            open={isCreateFormOpen}
            onOpenChange={setCreateFormOpen}
            onSubmit={onInitiativeCreate}
            users={allUsersData}
            allInitiatives={allInitiativesData || []}
        />
        )}
      </main>
    </>
  );
}

function StatCard({ title, value, icon, isNegative = false }: { title: string, value: string, icon: React.ReactNode, isNegative?: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn("h-4 w-4 text-muted-foreground", isNegative ? "text-red-500" : "text-green-500")}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}


function TaskTable({ tasks, initiatives }: { tasks: Task[]; initiatives: Initiative[] }) {
    const initiativesMap = useMemo(() => initiatives.reduce((acc, i) => {
        acc[i.id] = i;
        return acc;
    }, {} as Record<string, Initiative>), [initiatives]);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead>Task</TableHead>
          <TableHead>Initiative</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            <TableCell>
              <Badge
                variant="outline"
                className={cn(
                  task.status === 'Completed' ? 'text-green-600 border-green-200' : 
                  task.status === 'Blocked' ? 'text-red-600 border-red-200' : 
                  'text-muted-foreground'
                )}
              >
                {task.status}
              </Badge>
            </TableCell>
            <TableCell className="font-medium">{task.title}</TableCell>
            <TableCell>
              {initiativesMap[task.initiativeId] ? (
                 <Link href={`/initiatives/${task.initiativeId}`} className="hover:underline">
                    <Badge variant="secondary">{initiativesMap[task.initiativeId]?.name}</Badge>
                 </Link>
              ) : (
                <Badge variant="secondary">Unknown</Badge>
              )}
            </TableCell>
            <TableCell>{format(new Date(task.dueDate), "MM/dd/yyyy")}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>View Task</DropdownMenuItem>
                  <DropdownMenuItem>Mark as Complete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
