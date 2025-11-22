import { AppShell } from "@/components/app-shell";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUsers } from "@/lib/data";
import { PlusCircle } from "lucide-react";

export default function AdminPage() {
    const users = getUsers();
    const categories = [...new Set(getUsers().map(u => u.businessUnit))];

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
                        <Card>
                            <CardHeader>
                                <CardTitle>User Management</CardTitle>
                                <CardDescription>Add, edit, or remove users from the system.</CardDescription>
                                <Button className="w-fit ml-auto -mt-12">
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
                                            <TableHead>Business Unit</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map(user => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>{user.role}</TableCell>
                                                <TableCell>{user.businessUnit}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
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
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {categories.map(category => (
                                            <TableRow key={category}>
                                                <TableCell className="font-medium">{category}</TableCell>
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
