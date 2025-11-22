import {
  Activity,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  MoreVertical,
  PlusCircle,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import { AppShell } from '@/components/app-shell';
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
import { getInitiatives, getTasksForUser, getUser, getUsers } from '@/lib/data';
import { type Task, type User } from '@/lib/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { format } from 'date-fns';

const RAG_MAP = {
  Red: 'bg-red-500',
  Amber: 'bg-amber-500',
  Green: 'bg-green-500',
};

const STATUS_ICON_MAP = {
  'In Progress': <CircleDashed className="text-blue-500" />,
  'On Hold': <Activity className="text-yellow-500" />,
  Completed: <CheckCircle2 className="text-green-500" />,
  'Not Started': <CircleDashed className="text-gray-500" />,
  Cancelled: <CircleDashed className="text-red-500" />,
  Blocked: <CircleDashed className="text-red-500" />,
};

export default function DashboardPage() {
  const currentUser = getUser('1'); // Mock current user
  if (!currentUser) return null;
  
  const myInitiatives = getInitiatives().filter(
    (i) => i.leads.includes(currentUser.id) || i.teamMembers.includes(currentUser.id)
  );
  const myTasks = getTasksForUser(currentUser.id);
  const allUsers = getUsers();

  const userMap = allUsers.reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {} as Record<string, User>);

  const stats = {
    totalInitiatives: myInitiatives.length,
    completedTasks: myTasks.filter((t) => t.status === 'Completed').length,
    activeTasks: myTasks.filter((t) => t.status === 'In Progress').length,
    overdueTasks: myTasks.filter(
      (t) => new Date(t.dueDate) < new Date() && t.status !== 'Completed'
    ).length,
  };

  return (
    <AppShell>
      <Header />
      <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Welcome back, {currentUser.name.split(' ')[0]}!</h2>
          <div className="flex items-center space-x-2">
            <Button>
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
                      <p className="text-sm text-muted-foreground">{initiative.theme}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex -space-x-2 overflow-hidden">
                      {initiative.teamMembers.slice(0, 3).map((memberId) => (
                        <Avatar key={memberId} className="h-6 w-6 border-2 border-card">
                          <AvatarImage src={userMap[memberId]?.avatarUrl} />
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
               {myInitiatives.filter(i => i.leads.includes(currentUser.id)).slice(0,3).map(initiative => (
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
            <TaskTable tasks={myTasks.slice(0, 5)} users={userMap} />
          </CardContent>
          <CardFooter className="justify-center border-t p-4">
            <Button size="sm" variant="ghost" className="w-full">
              View All Tasks
            </Button>
          </CardFooter>
        </Card>
      </main>
    </AppShell>
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
        <p className="text-xs text-muted-foreground">
          {isNegative ? "-2% from last month" : "+10% from last month"}
        </p>
      </CardContent>
    </Card>
  );
}


function TaskTable({ tasks, users }: { tasks: Task[]; users: Record<string, User> }) {
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
              <Badge variant="secondary">{getInitiatives().find(i => i.id === task.initiativeId)?.name}</Badge>
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
