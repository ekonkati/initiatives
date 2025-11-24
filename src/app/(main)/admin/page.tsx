'use client';

import { AppShell } from "@/components/app-shell";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUsers, useInitiatives, useDepartments, useDesignations } from "@/lib/data";
import { Department, Designation, User } from "@/lib/types";
import { Database, MoreHorizontal, PlusCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { collection, doc, setDoc, updateDoc, deleteDoc, addDoc } from "firebase/firestore";
import { useFirestore, useAuth } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { runSeed } from "@/lib/seeding";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";


// Schemas
const userFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    role: z.enum(["Admin", "Initiative Lead", "Team Member", "Viewer"]),
    department: z.string().min(1, "Department is required"),
    designation: z.string().min(1, "Designation is required"),
});

const masterDataFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
});

type UserFormValues = z.infer<typeof userFormSchema>;
type MasterDataFormValues = z.infer<typeof masterDataFormSchema>;


export default function AdminPage() {
    const { data: usersData, isLoading: isLoadingUsers } = useUsers();
    const { data: initiativesData } = useInitiatives();
    const { data: departmentsData } = useDepartments();
    const { data: designationsData } = useDesignations();

    const users = usersData || [];
    const departments = departmentsData || [];
    const designations = designationsData || [];
    
    const firestore = useFirestore();
    const auth = useAuth();
    const { toast } = useToast();

    const [isUserFormOpen, setIsUserFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const [isDeptFormOpen, setIsDeptFormOpen] = useState(false);
    const [editingDept, setEditingDept] = useState<Department | null>(null);

    const [isDesigFormOpen, setIsDesigFormOpen] = useState(false);
    const [editingDesig, setEditingDesig] = useState<Designation | null>(null);

    const [isSeeding, setIsSeeding] = useState(false);
    const [seedConfirmation, setSeedConfirmation] = useState("");


    const categories = useMemo(() => {
        if (!initiativesData) return [];
        return [...new Set(initiativesData.map(i => i.category))];
    }, [initiativesData]);

    // User Management Handlers
    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setIsUserFormOpen(true);
    };

    const handleDeactivateUser = async (user: User) => {
        if (!firestore) return;
        const userRef = doc(firestore, 'users', user.id);
        await updateDoc(userRef, { active: false });
        toast({
            title: "User Deactivated",
            description: `${user.name} has been deactivated.`,
        });
    };

    const onUserFormSubmit = async (values: UserFormValues) => {
        if (!firestore) return;
        if (editingUser) {
            const userRef = doc(firestore, 'users', editingUser.id);
            await updateDoc(userRef, values);
            toast({
                title: "User Updated",
                description: `${values.name}'s profile has been updated.`,
            });
        }
        setIsUserFormOpen(false);
        setEditingUser(null);
    };

    // Master Data Handlers (Generic)
    const handleMasterDataSubmit = (collectionName: string, setFormOpen: (open: boolean) => void, setEditing: (item: any) => void, editingItem: any) => async (values: MasterDataFormValues) => {
        if (!firestore) return;
        if (editingItem) {
            const itemRef = doc(firestore, collectionName, editingItem.id);
            await updateDoc(itemRef, values);
        } else {
            await addDoc(collection(firestore, collectionName), values);
        }
        setFormOpen(false);
        setEditing(null);
    };
    
    const handleMasterDataDelete = (collectionName: string) => async (item: { id: string, name: string }) => {
        if (!firestore) return;
        await deleteDoc(doc(firestore, collectionName, item.id));
    };

    const handleSeedDatabase = async () => {
        setIsSeeding(true);
        try {
            if (!auth || !firestore) {
                throw new Error("Firebase services are not available.");
            }
            await runSeed(firestore, auth);
            toast({
                title: "Success",
                description: "Database has been seeded successfully.",
            });
        } catch (error) {
            console.error("Seeding failed:", error);
            toast({
                title: "Error",
                description: "Failed to seed the database. Check console for details.",
                variant: "destructive",
            });
        } finally {
            setIsSeeding(false);
            setSeedConfirmation("");
        }
    }


    return (
        <>
            <Header />
            <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Admin Settings</h2>
                </div>
                <Tabs defaultValue="users">
                    <TabsList>
                        <TabsTrigger value="users">Users</TabsTrigger>
                        <TabsTrigger value="categories">Categories</TabsTrigger>
                        <TabsTrigger value="departments">Departments</TabsTrigger>
                        <TabsTrigger value="designations">Designations</TabsTrigger>
                        <TabsTrigger value="ratings">Rating Dimensions</TabsTrigger>
                        <TabsTrigger value="system">System</TabsTrigger>
                    </TabsList>
                    
                    {/* Users Tab */}
                    <TabsContent value="users" className="mt-4">
                         <Dialog open={isUserFormOpen} onOpenChange={(open) => { setIsUserFormOpen(open); if (!open) setEditingUser(null); }}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>User Management</CardTitle>
                                    <CardDescription>Edit or remove users from the system.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Role</TableHead>
                                                <TableHead>Department</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {isLoadingUsers ? (
                                                <TableRow>
                                                    <TableCell colSpan={6}>
                                                        <div className="flex justify-center p-8">
                                                          <div className="rounded-md border bg-card px-6 py-3 text-lg font-semibold shadow-sm">Loading...</div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : users.map(user => (
                                                <TableRow key={user.id}>
                                                    <TableCell className="font-medium">{user.name}</TableCell>
                                                    <TableCell>{user.email}</TableCell>
                                                    <TableCell>{user.role}</TableCell>
                                                    <TableCell>{user.department}</TableCell>
                                                    <TableCell>{user.active ? "Active" : "Inactive"}</TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent>
                                                                <DropdownMenuItem onClick={() => handleEditUser(user)}>Edit</DropdownMenuItem>
                                                                {user.active && (
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-red-500 hover:text-red-600">
                                                                            Deactivate
                                                                        </div>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                This will mark the user as inactive. They will not be able to log in.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction onClick={() => handleDeactivateUser(user)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Deactivate</AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                            <UserFormDialog
                                key={editingUser ? editingUser.id : 'new'}
                                user={editingUser}
                                onSubmit={onUserFormSubmit}
                                onClose={() => setIsUserFormOpen(false)}
                                departments={departments}
                                designations={designations}
                            />
                        </Dialog>
                    </TabsContent>

                    {/* Categories Tab */}
                    <TabsContent value="categories" className="mt-4">
                        <MasterDataTable
                            title="Initiative Categories"
                            description="Manage the categories (themes) for initiatives."
                            data={categories.map(c => ({ id: c, name: c }))} // Adapt for string array
                            onAddNew={() => alert("Adding/Editing categories not implemented in this view.")}
                            onEdit={() => alert("Adding/Editing categories not implemented in this view.")}
                        />
                    </TabsContent>

                     {/* Departments Tab */}
                    <TabsContent value="departments" className="mt-4">
                        <Dialog open={isDeptFormOpen} onOpenChange={(open) => { setIsDeptFormOpen(open); if (!open) setEditingDept(null); }}>
                            <MasterDataTable
                                title="Departments"
                                description="Manage the departments within the organization."
                                data={departments}
                                onAddNew={() => { setEditingDept(null); setIsDeptFormOpen(true); }}
                                onEdit={(item) => { setEditingDept(item); setIsDeptFormOpen(true); }}
                                onDelete={(item) => {
                                    if(confirm(`Are you sure you want to delete ${item.name}?`)) {
                                       handleMasterDataDelete('departments')(item)
                                    }
                                }}
                            />
                            <MasterDataFormDialog
                                key={editingDept ? `dept-${editingDept.id}`: 'new-dept'}
                                item={editingDept}
                                title={editingDept ? "Edit Department" : "Add Department"}
                                description={editingDept ? "Edit the department name." : "Add a new department."}
                                onSubmit={handleMasterDataSubmit('departments', setIsDeptFormOpen, setEditingDept, editingDept)}
                                onClose={() => setIsDeptFormOpen(false)}
                            />
                        </Dialog>
                    </TabsContent>

                     {/* Designations Tab */}
                    <TabsContent value="designations" className="mt-4">
                        <Dialog open={isDesigFormOpen} onOpenChange={(open) => { setIsDesigFormOpen(open); if (!open) setEditingDesig(null); }}>
                            <MasterDataTable
                                title="Designations"
                                description="Manage the job titles and designations."
                                data={designations}
                                onAddNew={() => { setEditingDesig(null); setIsDesigFormOpen(true); }}
                                onEdit={(item) => { setEditingDesig(item); setIsDesigFormOpen(true); }}
                                onDelete={(item) => {
                                    if(confirm(`Are you sure you want to delete ${item.name}?`)) {
                                        handleMasterDataDelete('designations')(item)
                                    }
                                }}
                            />
                            <MasterDataFormDialog
                                key={editingDesig ? `desig-${editingDesig.id}`: 'new-desig'}
                                item={editingDesig}
                                title={editingDesig ? "Edit Designation" : "Add Designation"}
                                description={editingDesig ? "Edit the designation name." : "Add a new designation."}
                                onSubmit={handleMasterDataSubmit('designations', setIsDesigFormOpen, setEditingDesig, editingDesig)}
                                onClose={() => setIsDesigFormOpen(false)}
                            />
                        </Dialog>
                    </TabsContent>

                    {/* Rating Dimensions Tab */}
                    <TabsContent value="ratings" className="mt-4">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Initiative Rating Dimensions</CardTitle>
                                    <CardDescription>The core criteria used to rate the performance of an entire initiative.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                        <li><span className="font-semibold text-foreground">Impact:</span> The overall effect and value delivered by the initiative.</li>
                                        <li><span className="font-semibold text-foreground">Timeliness:</span> Adherence to deadlines and schedule.</li>
                                        <li><span className="font-semibold text-foreground">Execution:</span> The quality of the work and management of the process.</li>
                                        <li><span className="font-semibold text-foreground">Collaboration:</span> How well the team worked together and with stakeholders.</li>
                                    </ul>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>User Rating Dimensions</CardTitle>
                                    <CardDescription>The core criteria used to rate an individual's performance on an initiative.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                        <li><span className="font-semibold text-foreground">Ownership:</span> Accountability and proactiveness of the individual.</li>
                                        <li><span className="font-semibold text-foreground">Quality of Work:</span> The standard of the output delivered.</li>
                                        <li><span className="font-semibold text-foreground">Timeliness:</span> Meeting personal deadlines and commitments.</li>
                                        <li><span className="font-semibold text-foreground">Collaboration:</span> Contribution to the team dynamic and communication.</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* System Tab */}
                    <TabsContent value="system" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>System Actions</CardTitle>
                                <CardDescription>Perform system-level operations. Use with caution.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" disabled={isSeeding}>
                                            <Database className="mr-2 h-4 w-4" /> 
                                            {isSeeding ? "Seeding..." : "Seed Database"}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action will permanently delete all existing data (users, initiatives, etc.) and replace it with the default sample data. This cannot be undone.
                                                <br /><br />
                                                To confirm, please type <strong>DELETE</strong> into the box below.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <div className="grid gap-2">
                                            <Label htmlFor="delete-confirm" className="sr-only">Confirm Deletion</Label>
                                            <Input
                                                id="delete-confirm"
                                                type="text"
                                                placeholder="DELETE"
                                                value={seedConfirmation}
                                                onChange={(e) => setSeedConfirmation(e.target.value)}
                                            />
                                        </div>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel onClick={() => setSeedConfirmation("")}>Cancel</AlertDialogCancel>
                                            <AlertDialogAction 
                                                onClick={handleSeedDatabase}
                                                disabled={seedConfirmation !== 'DELETE' || isSeeding}
                                            >
                                                {isSeeding ? "Deleting and Seeding..." : "Continue"}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                <p className="text-sm text-muted-foreground mt-2">
                                    This will wipe all current data and load the initial sample data set.
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </>
    );
}

// Reusable Components
interface MasterDataTableProps {
    title: string;
    description: string;
    data: { id: string; name: string }[];
    onAddNew: () => void;
    onEdit: (item: { id: string; name: string }) => void;
    onDelete?: (item: { id: string; name: string }) => void;
}

function MasterDataTable({ title, description, data, onAddNew, onEdit, onDelete }: MasterDataTableProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
                <Button className="w-fit ml-auto -mt-12" onClick={onAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => onEdit(item)}>Edit</DropdownMenuItem>
                                            {onDelete && <DropdownMenuItem className="text-red-500" onClick={() => onDelete(item)}>Delete</DropdownMenuItem>}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

interface UserFormDialogProps {
    user: User | null;
    onSubmit: (values: UserFormValues) => void;
    onClose: () => void;
    departments: Department[];
    designations: Designation[];
}

function UserFormDialog({ user, onSubmit, onClose, departments, designations }: UserFormDialogProps) {
    const form = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: user ? {
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            designation: user.designation,
        } : {},
    });

    useState(() => {
        if (user) {
            form.reset({
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                designation: user.designation,
            });
        }
    }, [user, form]);


    const title = user ? "Edit User" : "Add New User";
    const description = user
        ? "Make changes to the user's profile. Click save when you're done."
        : "Add a new user to the system. Click save to create the user.";

    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl><Input type="email" placeholder="john.doe@example.com" {...field} disabled={!!user} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="role" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                    <SelectItem value="Initiative Lead">Initiative Lead</SelectItem>
                                    <SelectItem value="Team Member">Team Member</SelectItem>
                                    <SelectItem value="Viewer">Viewer</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="department" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Department</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a department" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {departments.map(dept => <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="designation" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Designation</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a designation" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {designations.map(desig => <SelectItem key={desig.id} value={desig.name}>{desig.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save changes</Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
}


interface MasterDataFormDialogProps {
    item: { id: string, name: string } | null;
    title: string;
    description: string;
    onSubmit: (values: MasterDataFormValues) => void;
    onClose: () => void;
}

function MasterDataFormDialog({ item, title, description, onSubmit, onClose }: MasterDataFormDialogProps) {
    const form = useForm<MasterDataFormValues>({
        resolver: zodResolver(masterDataFormSchema),
        defaultValues: { name: item?.name || "" },
    });

    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl><Input placeholder="Enter name" {...field} /></FormControl>
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
    );
}
