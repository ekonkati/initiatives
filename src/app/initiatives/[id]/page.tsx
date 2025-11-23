
"use client";

import { AppShell } from "@/components/app-shell";
import { Header } from "@/components/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInitiative, useTasksForInitiative, useUsers, useAttachmentsForInitiative } from "@/lib/data";
import { RAGStatus, Task, User, TaskStatus, Attachment } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ChevronLeft, Clock, File, GanttChartSquare, Pencil, PlusCircle, Star, Trash2, Upload, MoreHorizontal, ExternalLink, FilePenLine } from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import React, { useMemo, useState, useRef } from "react";
import { useFirestore, useUser as useAuthUser, useStorage } from "@/firebase";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { addDoc, collection, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RAG_MAP: Record<RAGStatus, string> = {
  Red: 'border-red-500 text-red-500',
  Amber: 'border-amber-500 text-amber-500',
  Green: 'border-green-500 text-green-500',
};


export default function InitiativeDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const { user: authUser } = useAuthUser();

    const { data: initiative, isLoading: isLoadingInitiative, error } = useInitiative(id);
    const { data: allUsersData, isLoading: isLoadingUsers } = useUsers();
    const { data: tasksData, isLoading: isLoadingTasks } = useTasksForInitiative(id);
    const { data: attachmentsData, isLoading: isLoadingAttachments } = useAttachmentsForInitiative(id);
    
    const userMap = useMemo(() => {
        if (!allUsersData) return {};
        return allUsersData.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {} as Record<string, User>);
    }, [allUsersData]);

    const tasks = tasksData || [];
    const users = allUsersData || [];
    const attachments = attachmentsData || [];

    const isLoading = isLoadingInitiative || isLoadingUsers || isLoadingTasks || isLoadingAttachments;

    if (isLoading) {
        return (
            <AppShell>
                <Header />
                <main className="flex-1 flex items-center justify-center p-4">
                    <div>Loading initiative details...</div>
                </main>
            </AppShell>
        );
    }
    
    if (error) {
        // This will be caught by the error boundary
        throw error;
    }

    if (!initiative) {
        return notFound();
    }

    const isMember = authUser && (initiative.leadIds.includes(authUser.uid) || initiative.teamMemberIds.includes(authUser.uid));


    return (
        <AppShell>
            <Header />
            <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Link href="/initiatives">
                      <Button variant="outline" size="icon" className="h-7 w-7">
                          <ChevronLeft className="h-4 w-4" />
                          <span className="sr-only">Back</span>
                      </Button>
                    </Link>
                    <h2 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                      {initiative.name}
                      <Badge variant="secondary">{initiative.category}</Badge>
                    </h2>
                  </div>
                  <Button>
                    <Pencil className="mr-2 h-4 w-4" /> Edit Initiative
                  </Button>
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
                                            {initiative.leadIds.map(id => userMap[id] && <UserAvatar user={userMap[id]} key={id} />)}
                                        </div>
                                        <h4 className="text-sm font-semibold mb-2">Core Team</h4>
                                        <div className="flex flex-wrap gap-4">
                                            {initiative.teamMemberIds.map(id => userMap[id] && <UserAvatar user={userMap[id]} key={id} />)}
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
                                        <p className="text-sm text-muted-foreground">Start: {format(new Date(initiative.startDate), "MM/dd/yyyy")}</p>
                                        <p className="text-sm text-muted-foreground">End: {format(new Date(initiative.endDate), "MM/dd/yyyy")}</p>
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
                        <TaskManager 
                            initiativeId={id}
                            tasks={tasks}
                            users={users}
                            userMap={userMap}
                            isMember={isMember ?? false}
                        />
                    </TabsContent>

                    <TabsContent value="documents">
                       <DocumentManager
                            initiativeId={id}
                            attachments={attachments}
                            userMap={userMap}
                            isMember={isMember ?? false}
                       />
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
            <AvatarImage src={user.photoUrl} />
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

// Task Components

const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  ownerId: z.string().min(1, "Owner is required"),
  status: z.nativeEnum(TaskStatus),
  dueDate: z.date({ required_error: "Due date is required" }),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskManagerProps {
    initiativeId: string;
    tasks: Task[];
    users: User[];
    userMap: Record<string, User>;
    isMember: boolean;
}

function TaskManager({ initiativeId, tasks, users, userMap, isMember }: TaskManagerProps) {
    const [isTaskFormOpen, setTaskFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleAddNewTask = () => {
        setEditingTask(null);
        setTaskFormOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setTaskFormOpen(true);
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
            await deleteDoc(doc(firestore, 'initiatives', initiativeId, 'tasks', taskId));
            toast({ title: "Task Deleted", description: "The task has been removed." });
        } catch (error: any) {
            toast({ title: "Error", description: `Could not delete task: ${error.message}`, variant: "destructive" });
        }
    };

    const onTaskFormSubmit = async (values: TaskFormValues) => {
        try {
            if (editingTask) {
                const taskRef = doc(firestore, 'initiatives', initiativeId, 'tasks', editingTask.id);
                await updateDoc(taskRef, { ...values, dueDate: values.dueDate.toISOString() });
                toast({ title: "Task Updated" });
            } else {
                const tasksCol = collection(firestore, 'initiatives', initiativeId, 'tasks');
                await addDoc(tasksCol, {
                    ...values,
                    initiativeId,
                    dueDate: values.dueDate.toISOString(),
                    progress: 0,
                    createdAt: new Date().toISOString(),
                });
                toast({ title: "Task Created" });
            }
            setTaskFormOpen(false);
            setEditingTask(null);
        } catch (error: any) {
            toast({ title: "Error", description: `Could not save task: ${error.message}`, variant: "destructive" });
        }
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Tasks</CardTitle>
                        <CardDescription>All tasks associated with this initiative.</CardDescription>
                    </div>
                    {isMember && (
                        <Button onClick={handleAddNewTask}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Task
                        </Button>
                    )}
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
                                <TableHead className="text-right">Actions</TableHead>
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
                                                <AvatarImage src={userMap[task.ownerId]?.photoUrl} />
                                                <AvatarFallback>{userMap[task.ownerId]?.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span>{userMap[task.ownerId]?.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{format(new Date(task.dueDate), "MM/dd/yyyy")}</TableCell>
                                    <TableCell><Progress value={task.progress || 0} className="h-2" /></TableCell>
                                    <TableCell className="text-right">
                                        {isMember && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => handleEditTask(task)}>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteTask(task.id)}>Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <TaskFormDialog
                key={editingTask ? editingTask.id : 'new'}
                open={isTaskFormOpen}
                onOpenChange={setTaskFormOpen}
                onSubmit={onTaskFormSubmit}
                task={editingTask}
                users={users}
            />
        </>
    );
}

interface TaskFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: TaskFormValues) => void;
    task: Task | null;
    users: User[];
}

function TaskFormDialog({ open, onOpenChange, onSubmit, task, users }: TaskFormDialogProps) {
    const form = useForm<TaskFormValues>({
        resolver: zodResolver(taskFormSchema),
        defaultValues: {
            title: task?.title || "",
            description: task?.description || "",
            ownerId: task?.ownerId || "",
            status: task?.status || TaskStatus.NotStarted,
            dueDate: task?.dueDate ? new Date(task.dueDate) : new Date(),
        },
    });

    const title = task ? "Edit Task" : "Add New Task";
    const description = task ? "Make changes to the task." : "Add a new task to this initiative.";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl><Input placeholder="Task title" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl><Textarea placeholder="Describe the task" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="ownerId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Owner</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select an owner" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {users.map(user => <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="status" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a status" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {Object.values(TaskStatus).map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="dueDate" render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Due Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant={"outline"} className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit">Save Task</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

// Attachment Components

const renameFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
});
type RenameFormValues = z.infer<typeof renameFormSchema>;

interface DocumentManagerProps {
    initiativeId: string;
    attachments: Attachment[];
    userMap: Record<string, User>;
    isMember: boolean;
}

function DocumentManager({ initiativeId, attachments, userMap, isMember }: DocumentManagerProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isRenaming, setIsRenaming] = useState<Attachment | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    
    const firestore = useFirestore();
    const storage = useStorage();
    const { user: authUser } = useAuthUser();
    const { toast } = useToast();

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !authUser) return;

        const storagePath = `initiatives/${initiativeId}/attachments/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Upload failed:", error);
                toast({ title: "Upload Error", description: "Could not upload file.", variant: "destructive" });
                setUploadProgress(null);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                    const attachmentsCol = collection(firestore, 'initiatives', initiativeId, 'attachments');
                    await addDoc(attachmentsCol, {
                        initiativeId,
                        name: file.name,
                        storagePath,
                        downloadURL,
                        fileType: file.type || 'unknown',
                        uploadedBy: authUser.uid,
                        createdAt: new Date().toISOString(),
                    });
                    toast({ title: "Upload Complete", description: `${file.name} has been uploaded.` });
                    setUploadProgress(null);
                });
            }
        );
         // Reset file input
        if(fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleRename = (attachment: Attachment) => {
        setIsRenaming(attachment);
    };

    const handleDelete = async (attachment: Attachment) => {
        if (!confirm(`Are you sure you want to delete "${attachment.name}"?`)) return;

        const storageRef = ref(storage, attachment.storagePath);
        try {
            await deleteObject(storageRef);
            await deleteDoc(doc(firestore, 'initiatives', initiativeId, 'attachments', attachment.id));
            toast({ title: "File Deleted", description: `"${attachment.name}" has been removed.` });
        } catch (error: any) {
            console.error("Deletion failed:", error);
            toast({ title: "Error", description: `Could not delete file: ${error.message}`, variant: "destructive" });
        }
    };
    
    const onRenameSubmit = async (values: RenameFormValues) => {
        if (!isRenaming) return;
        const docRef = doc(firestore, 'initiatives', initiativeId, 'attachments', isRenaming.id);
        try {
            await updateDoc(docRef, { name: values.name });
            toast({ title: "File Renamed" });
            setIsRenaming(null);
        } catch (error: any) {
            toast({ title: "Error", description: `Could not rename file: ${error.message}`, variant: "destructive" });
        }
    };


    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Documents</CardTitle>
                        <CardDescription>Manage files for this initiative.</CardDescription>
                    </div>
                     {isMember && (
                        <>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                            <Button onClick={handleUploadClick} disabled={uploadProgress !== null}>
                                {uploadProgress !== null ? `Uploading ${uploadProgress.toFixed(0)}%` : <><Upload className="mr-2 h-4 w-4" /> Upload File</>}
                            </Button>
                        </>
                    )}
                </CardHeader>
                <CardContent>
                    {uploadProgress !== null && <Progress value={uploadProgress} className="mb-4" />}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Owner</TableHead>
                                <TableHead>Date Added</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attachments.map(attachment => (
                                <TableRow key={attachment.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <File className="h-4 w-4" />
                                        {attachment.name}
                                    </TableCell>
                                    <TableCell><Badge variant="outline">{attachment.fileType}</Badge></TableCell>
                                    <TableCell>{userMap[attachment.uploadedBy]?.name || 'Unknown'}</TableCell>
                                    <TableCell>{attachment.createdAt ? format(new Date(attachment.createdAt), "MM/dd/yyyy") : ''}</TableCell>
                                    <TableCell className="text-right">
                                        <a href={attachment.downloadURL} target="_blank" rel="noopener noreferrer">
                                            <Button variant="ghost" size="icon">
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </a>
                                        {isMember && authUser?.uid === attachment.uploadedBy && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => handleRename(attachment)}>
                                                        <FilePenLine className="mr-2 h-4 w-4" />Rename
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-500" onClick={() => handleDelete(attachment)}>
                                                        <Trash2 className="mr-2 h-4 w-4" />Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <RenameDialog 
                attachment={isRenaming}
                onSubmit={onRenameSubmit}
                onClose={() => setIsRenaming(null)}
            />
        </>
    );
}

interface RenameDialogProps {
    attachment: Attachment | null;
    onSubmit: (values: RenameFormValues) => void;
    onClose: () => void;
}

function RenameDialog({ attachment, onSubmit, onClose }: RenameDialogProps) {
    const form = useForm<RenameFormValues>({
        resolver: zodResolver(renameFormSchema),
        defaultValues: { name: attachment?.name || "" },
    });

    // Reset form when attachment changes
    React.useEffect(() => {
        if (attachment) {
            form.reset({ name: attachment.name });
        }
    }, [attachment, form]);

    return (
        <Dialog open={!!attachment} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                 <DialogHeader>
                    <DialogTitle>Rename File</DialogTitle>
                    <DialogDescription>Enter a new name for the file.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                         <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>File Name</FormLabel>
                                <FormControl><Input placeholder="Enter new name" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
