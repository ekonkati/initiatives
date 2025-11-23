
'use client';

import { AppShell } from "@/components/app-shell";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUsers, useInitiatives } from "@/lib/data";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User } from "@/lib/types";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase";

const userFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    role: z.enum(["Admin", "Initiative Lead", "Team Member", "Viewer"]),
    department: z.string().min(1, "Department is required"),
    designation: z.string().min(1, "Designation is required"),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function AdminPage() {
    const { data: usersData } = useUsers();
    const { data: initiativesData } = useInitiatives();
    const users = usersData || [];
    const firestore = useFirestore();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const categories = useMemo(() => {
        if (!initiativesData) return [];
        return [...new Set(initiativesData.map(i => i.category))];
    }, [initiativesData]);

    const handleAddNew = () => {
        setEditingUser(null);
        setIsFormOpen(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsFormOpen(true);
    };

    const handleDeactivate = async (user: User) => {
        if (confirm(`Are you sure you want to deactivate ${user.name}?`)) {
            const userRef = doc(firestore, 'users', user.id);
            await updateDoc(userRef, { active: false });
        }
    };

    const onFormSubmit = async (values: UserFormValues) => {
        if (editingUser) {
            // Update existing user
            const userRef = doc(firestore, 'users', editingUser.id);
            await updateDoc(userRef, values);
        } else {
            // This is a placeholder for adding a new user.
            // A real implementation would require creating an auth user first.
            alert("Adding a new user requires creating an authentication entry first, which is not implemented in this prototype.");
        }
        setIsFormOpen(false);
        setEditingUser(null);
    };


    return (
        <AppShell>
            <Header />
            <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Admin Settings</h2>
                </div>
                <Tabs defaultValue="users">
                    <TabsList>
                        <TabsTrigger value="users">Users</TabsTrigger>
                        <TabsTrigger value="categories">Categories</TabsTrigger>
                        <TabsTrigger value="ratings">Rating Dimensions</TabsTrigger>
                    </TabsList>
                    <TabsContent value="users" className="mt-4">
                         <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>User Management</CardTitle>
                                    <CardDescription>Add, edit, or remove users from the system.</CardDescription>
                                    <Button className="w-fit ml-auto -mt-12" onClick={handleAddNew}>
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add User
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Role</TableHead>
                                                <TableHead>Department</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.map(user => (
                                                <TableRow key={user.id}>
                                                    <TableCell className="font-medium">{user.name}</TableCell>
                                                    <TableCell>{user.email}</TableCell>
                                                    <TableCell>{user.role}</TableCell>
                                                    <TableCell>{user.department}</TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent>
                                                                <DropdownMenuItem onClick={() => handleEdit(user)}>Edit</DropdownMenuItem>
                                                                <DropdownMenuItem className="text-red-500" onClick={() => handleDeactivate(user)}>Deactivate</DropdownMenuItem>
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
                                user={editingUser}
                                onSubmit={onFormSubmit}
                                onClose={() => setIsFormOpen(false)}
                            />
                        </Dialog>
                    </TabsContent>
                    <TabsContent value="categories" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Initiative Categories</CardTitle>
                                <CardDescription>Manage the categories (themes) for initiatives.</CardDescription>
                                <Button className="w-fit ml-auto -mt-12">
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Category
                                </Button>
                            </CardHeader>
                            <CardContent>
                               <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Category Name</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {categories.map(category => (
                                            <TableRow key={category}>
                                                <TableCell className="font-medium">{category}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            <DropdownMenuItem>Edit</DropdownMenuItem>
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
                    </TabsContent>
                </Tabs>
            </main>
        </AppShell>
    );
}


interface UserFormDialogProps {
    user: User | null;
    onSubmit: (values: UserFormValues) => void;
    onClose: () => void;
}

function UserFormDialog({ user, onSubmit, onClose }: UserFormDialogProps) {
    const form = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            name: user?.name || "",
            email: user?.email || "",
            role: user?.role || "Team Member",
            department: user?.department || "",
            designation: user?.designation || "",
        },
    });

    // Reset form when user changes
    const memoizedUser = useMemo(() => user, [user]);
    useMemo(() => {
        form.reset({
            name: memoizedUser?.name || "",
            email: memoizedUser?.email || "",
            role: memoizedUser?.role || "Team Member",
            department: memoizedUser?.department || "",
            designation: memoizedUser?.designation || "",
        });
    }, [memoizedUser, form]);


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
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="john.doe@example.com" {...field} disabled={!!user} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Admin">Admin</SelectItem>
                                        <SelectItem value="Initiative Lead">Initiative Lead</SelectItem>
                                        <SelectItem value="Team Member">Team Member</SelectItem>
                                        <SelectItem value="Viewer">Viewer</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="department"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Department</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Technology" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="designation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Designation</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Software Engineer" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save changes</Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
}

