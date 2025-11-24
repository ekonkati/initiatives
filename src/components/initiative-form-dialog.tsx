
'use client';

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Initiative, User, InitiativeStatus, InitiativePriority } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import React from "react";

const initiativeFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  objectives: z.string().min(1, "Objectives are required"),
  category: z.string().min(1, "Category is required"),
  status: z.nativeEnum(InitiativeStatus),
  priority: z.nativeEnum(InitiativePriority),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  leadIds: z.array(z.string()).min(1, "At least one lead is required"),
  teamMemberIds: z.array(z.string()).optional(),
}).refine((data) => data.endDate >= data.startDate, {
  message: "End date cannot be before start date",
  path: ["endDate"],
});

type InitiativeFormValues = z.infer<typeof initiativeFormSchema>;

interface InitiativeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: InitiativeFormValues) => void;
  initiative?: Initiative | null;
  users: User[];
  allInitiatives: Initiative[];
}

export function InitiativeFormDialog({ open, onOpenChange, onSubmit, initiative, users, allInitiatives }: InitiativeFormDialogProps) {
  const defaultValues = initiative ? {
      ...initiative,
      startDate: new Date(initiative.startDate),
      endDate: new Date(initiative.endDate),
  } : {
      name: "",
      description: "",
      objectives: "",
      category: "",
      status: InitiativeStatus.NotStarted,
      priority: InitiativePriority.Medium,
      startDate: new Date(),
      endDate: new Date(),
      leadIds: [],
      teamMemberIds: [],
  };
    
  const form = useForm<InitiativeFormValues>({
    resolver: zodResolver(initiativeFormSchema),
    defaultValues: defaultValues,
  });

  React.useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, initiative, form]);

  const existingCategories = React.useMemo(() => {
    return [...new Set(allInitiatives.map(i => i.category))];
  }, [allInitiatives]);

  const title = initiative ? "Edit Initiative" : "Create New Initiative";
  const description = initiative ? "Update the details of the initiative." : "Fill in the details to create a new initiative.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Initiative Name</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="objectives" render={({ field }) => (
              <FormItem>
                <FormLabel>Objectives</FormLabel>
                <FormControl><Textarea {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                    <FormLabel>Category / Theme</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {existingCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                             <SelectItem value="new">...Add New Category</SelectItem>
                        </SelectContent>
                    </Select>
                     {/* TODO: Add input for new category */}
                    <FormMessage />
                </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a status" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {Object.values(InitiativeStatus).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="priority" render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a priority" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {Object.values(InitiativePriority).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

             <div className="grid grid-cols-2 gap-4">
                 <FormField control={form.control} name="startDate" render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
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
                 <FormField control={form.control} name="endDate" render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
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
             </div>
            
            <FormField control={form.control} name="leadIds" render={({ field }) => (
              <FormItem>
                <FormLabel>Leads</FormLabel>
                 <Controller
                    control={form.control}
                    name="leadIds"
                    render={({ field: { onChange, value } }) => (
                        <Select onValueChange={(val) => onChange([...(value || []), val])}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Add leads" /></SelectTrigger></FormControl>
                            <SelectContent>
                                {users.filter(u => !value?.includes(u.id)).map(user => <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                 />
                <div className="flex flex-wrap gap-2 mt-2">
                    {field.value?.map(userId => (
                        <Badge key={userId} variant="secondary">
                            {users.find(u => u.id === userId)?.name}
                            <button
                                type="button"
                                className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                onClick={() => field.onChange(field.value?.filter(id => id !== userId))}
                            >
                                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                            </button>
                        </Badge>
                    ))}
                </div>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="teamMemberIds" render={({ field }) => (
              <FormItem>
                <FormLabel>Core Team Members</FormLabel>
                 <Controller
                    control={form.control}
                    name="teamMemberIds"
                    render={({ field: { onChange, value } }) => (
                        <Select onValueChange={(val) => onChange([...(value || []), val])}>
                             <FormControl><SelectTrigger><SelectValue placeholder="Add team members" /></SelectTrigger></FormControl>
                            <SelectContent>
                                {users.filter(u => !value?.includes(u.id) && !form.getValues('leadIds')?.includes(u.id)).map(user => <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                 />
                 <div className="flex flex-wrap gap-2 mt-2">
                    {field.value?.map(userId => (
                        <Badge key={userId} variant="secondary">
                            {users.find(u => u.id === userId)?.name}
                             <button
                                type="button"
                                className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                onClick={() => field.onChange(field.value?.filter(id => id !== userId))}
                            >
                                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                            </button>
                        </Badge>
                    ))}
                </div>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Save Initiative</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

const X = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
)
