import { AppShell } from "@/components/app-shell";
import { Header } from "@/components/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getUsers } from "@/lib/data";
import { Mail, Phone } from "lucide-react";
import Link from "next/link";

export default function PeoplePage() {
    const users = getUsers();
    return (
        <AppShell>
            <Header />
            <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">People</h2>
                    <Input placeholder="Search people..." className="max-w-sm" />
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {users.map(user => (
                        <Card key={user.id} className="flex flex-col">
                            <CardHeader className="flex-grow">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={user.avatarUrl} />
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-lg">
                                            <Link href={`/people/${user.id}`} className="hover:underline">{user.name}</Link>
                                        </CardTitle>
                                        <CardDescription>{user.designation}</CardDescription>
                                        <CardDescription className="font-semibold text-primary">{user.businessUnit}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center gap-4 border-t pt-4 mt-auto">
                                <Button variant="outline" size="icon">
                                    <Mail className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon">
                                    <Phone className="h-4 w-4" />
                                </Button>
                                <Button asChild className="flex-1">
                                    <Link href={`/people/${user.id}`}>View Profile</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>
        </AppShell>
    )
}
