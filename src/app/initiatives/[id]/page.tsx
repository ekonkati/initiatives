
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
import { useInitiative, useTasksForInitiative, useUsers, useAttachments } from "@/lib/data";
import { RAGStatus, Task, User, Attachment, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ChevronLeft, Clock, File, GanttChartSquare, Pencil, PlusCircle, Star, Trash2, Upload, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import React, { useMemo, useState } from "react";
import { useFirestore, useUser as useAuthUser, useStorage } from "@/firebase";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { addDoc, collection, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
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

    const { data: initiative, isLoading: isLoadingInitiative, error } = useInitiative(id);
    const { data: allUsersData, isLoading: isLoadingUsers } = useUsers();
    const { data: tasksData, isLoading: isLoadingTasks } = useTasksForInitiative(id);
    const { data: attachmentsData, isLoading: isLoadingAttachments } = useAttachments(id);
    
    const userMap = useMemo(() => {
        if (!allUsersData) return {};
        return allUsersData.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {} as Record<string, User>);
    }, [allUsersData]);

    const tasks = tasksData || [];
    const attachments = attachmentsData || [];
    const users = allUsersData || [];

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
                        />
                    </TabsContent>

                    <TabsContent value="documents">
                        <AttachmentManager 
                            initiativeId={id} 
                            attachments={attachments} 
                            userMap={userMap} 
                            isLoading={isLoadingAttachments} 
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

// Attachment Components

interface AttachmentManagerProps {
    initiativeId: string;
    attachments: Attachment[];
    userMap: Record<string, User>;
    isLoading: boolean;
}

function AttachmentManager({ initiativeId, attachments, userMap, isLoading }: AttachmentManagerProps) {
    const [isUploadOpen, setUploadOpen] = useState(false);
    const [isRenameOpen, setRenameOpen] = useState(false);
    const [isDeleteOpen, setDeleteOpen] = useState(false);
    const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Documents</CardTitle>
                        <CardDescription>Files and documents attached to this initiative.</CardDescription>
                    </div>
                    <Button onClick={() => setUploadOpen(true)}><Upload className="mr-2 h-4 w-4" /> Attach File</Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? <p>Loading documents...</p> :
                        <ul className="space-y-2">
                            {attachments.map(att => (
                                <li key={att.id} className="flex items-center justify-between rounded-md border p-3">
                                    <div className="flex items-center gap-3">
                                        <File className="h-6 w-6 text-muted-foreground" />
                                        <div>
                                            <a href={att.downloadUrl} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">{att.fileName}</a>
                                            <p className="text-sm text-muted-foreground">Uploaded by {userMap[att.uploadedBy]?.name} on {format(new Date(att.uploadedAt), "MM/dd/yyyy")}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">{att.fileType}</Badge>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => { setSelectedAttachment(att); setRenameOpen(true); }}>Rename</DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-500" onClick={() => { setSelectedAttachment(att); setDeleteOpen(true); }}>Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    }
                </CardContent>
            </Card>

            <UploadAttachmentDialog open={isUploadOpen} onOpenChange={setUploadOpen} initiativeId={initiativeId} />
            
            {selectedAttachment && (
                <>
                    <RenameAttachmentDialog open={isRenameOpen} onOpenChange={setRenameOpen} attachment={selectedAttachment} />
                    <DeleteAttachmentDialog open={isDeleteOpen} onOpenChange={setDeleteOpen} attachment={selectedAttachment} />
                </>
            )}
        </>
    );
}

function UploadAttachmentDialog({ open, onOpenChange, initiativeId }: { open: boolean, onOpenChange: (open: boolean) => void, initiativeId: string }) {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const storage = useStorage();
    const firestore = useFirestore();
    const { user } = useAuthUser();
    const { toast } = useToast();

    const handleUpload = async () => {
        if (!file || !user) return;

        setIsUploading(true);
        const storagePath = `initiatives/${initiativeId}/attachments/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                setProgress(prog);
            },
            (error) => {
                console.error("Upload error", error);
                toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
                setIsUploading(false);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                const attachmentsCol = collection(firestore, `initiatives/${initiativeId}/attachments`);

                await addDoc(attachmentsCol, {
                    initiativeId,
                    fileName: file.name,
                    fileType: file.type || 'unknown',
                    storagePath,
                    downloadUrl: downloadURL,
                    uploadedBy: user.uid,
                    uploadedAt: new Date().toISOString(),
                });

                toast({ title: "Upload Complete", description: `${file.name} has been attached.` });
                setIsUploading(false);
                setFile(null);
                onOpenChange(false);
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Attach a New File</DialogTitle>
                    <DialogDescription>Select a file from your device to upload to this initiative.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="file">File</Label>
                        <Input id="file" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    </div>
                    {isUploading && (
                        <div className="flex items-center gap-2">
                            <Progress value={progress} className="w-full" />
                            <span>{progress}%</span>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>Cancel</Button>
                    <Button onClick={handleUpload} disabled={!file || isUploading}>
                        {isUploading ? "Uploading..." : "Upload"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function RenameAttachmentDialog({ open, onOpenChange, attachment }: { open: boolean, onOpenChange: (open: boolean) => void, attachment: Attachment }) {
    const [newName, setNewName] = useState(attachment.fileName);
    const [isRenaming, setIsRenaming] = useState(false);
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleRename = async () => {
        if (!newName || newName === attachment.fileName) {
            onOpenChange(false);
            return;
        }
        setIsRenaming(true);
        const docRef = doc(firestore, `initiatives/${attachment.initiativeId}/attachments`, attachment.id);
        try {
            await updateDoc(docRef, { fileName: newName });
            toast({ title: "File Renamed", description: `Renamed to ${newName}.` });
            onOpenChange(false);
        } catch (error: any) {
            console.error("Rename failed:", error);
            toast({ title: "Rename Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsRenaming(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rename File</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Label htmlFor="fileName">File Name</Label>
                    <Input id="fileName" value={newName} onChange={(e) => setNewName(e.target.value)} />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isRenaming}>Cancel</Button>
                    <Button onClick={handleRename} disabled={isRenaming}>{isRenaming ? "Renaming..." : "Save"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function DeleteAttachmentDialog({ open, onOpenChange, attachment }: { open: boolean, onOpenChange: (open: boolean) => void, attachment: Attachment }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const firestore = useFirestore();
    const storage = useStorage();
    const { toast } = useToast();

    const handleDelete = async () => {
        setIsDeleting(true);
        const docRef = doc(firestore, `initiatives/${attachment.initiativeId}/attachments`, attachment.id);
        const storageRef = ref(storage, attachment.storagePath);
        try {
            await deleteObject(storageRef);
            await deleteDoc(docRef);
            toast({ title: "File Deleted", description: `${attachment.fileName} has been deleted.` });
            onOpenChange(false);
        } catch (error: any) {
            console.error("Delete failed:", error);
            toast({ title: "Delete Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>This will permanently delete <span className="font-semibold">{attachment.fileName}</span>. This action cannot be undone.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
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
}

function TaskManager({ initiativeId, tasks, users, userMap }: TaskManagerProps) {
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
                    // createdAt: serverTimestamp(), // Requires modifying types
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
                    <Button onClick={handleAddNewTask}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Task
                    </Button>
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
