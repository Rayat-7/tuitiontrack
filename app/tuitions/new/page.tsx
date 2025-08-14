"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, BookOpen, Loader2, MapPin, Calendar } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { toast } from "sonner"

const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Bangla",
  "Economics",
  "Accounting",
  "ICT",
  "General Science",
  "Social Science",
  "Other",
]

const DAYS_OF_WEEK = [
  { id: "saturday", label: "Saturday", short: "Sat" },
  { id: "sunday", label: "Sunday", short: "Sun" },
  { id: "monday", label: "Monday", short: "Mon" },
  { id: "tuesday", label: "Tuesday", short: "Tue" },
  { id: "wednesday", label: "Wednesday", short: "Wed" },
  { id: "thursday", label: "Thursday", short: "Thu" },
  { id: "friday", label: "Friday", short: "Fri" },
]

type TuitionFormData = {
  name: string
  subject: string
  description: string
  address: string
  teaching_days: string[]
}

export default function NewTuition() {
  const router = useRouter()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<TuitionFormData>({
    name: "",
    subject: "",
    description: "",
    address: "",
    teaching_days: [],
  })

  const handleInputChange = (field: keyof TuitionFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleDayToggle = (dayId: string) => {
    setFormData((prev) => ({
      ...prev,
      teaching_days: prev.teaching_days.includes(dayId)
        ? prev.teaching_days.filter((d) => d !== dayId)
        : [...prev.teaching_days, dayId],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !user ||
      !formData.name.trim() ||
      !formData.subject ||
      !formData.address.trim() ||
      formData.teaching_days.length === 0
    ) {
      toast.error("Please fill in all required fields and select at least one teaching day")
      return
    }

    setLoading(true)
    console.log("🔍 Creating tuition for user:", user.id)

    try {
      // Step 1: Get the user's ID from Supabase
      console.log("🔍 Looking up user in database...")
      let { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", user.id)
        .single()

      if (userError) {
        console.error("Error finding user:", userError)

        // If user doesn't exist, create them first
        if (userError.code === "PGRST116") {
          console.log("🔍 User not found, creating user first...")

          const newUserData = {
            clerk_id: user.id,
            email: user.emailAddresses[0]?.emailAddress || "",
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
            role: "tutor" as const,
            is_active: true,
          }

          const { data: createdUser, error: createError } = await supabase
            .from("users")
            .insert(newUserData)
            .select("id")
            .single()

          if (createError) {
            throw new Error(`Failed to create user: ${createError.message}`)
          }

          console.log("✅ User created successfully")
          userData = createdUser
        } else {
          throw userError
        }
      }

      if (!userData) {
        throw new Error("Failed to get user data")
      }

      console.log("🔍 Creating tuition...")

      // Step 2: Create the tuition with new fields
      const { data: tuitionData, error: tuitionError } = await supabase
        .from("tuitions")
        .insert({
          name: formData.name.trim(),
          subject: formData.subject,
          description: formData.description.trim() || null,
          address: formData.address.trim(),
          teaching_days: formData.teaching_days,
          days_per_week: formData.teaching_days.length,
          tutor_id: userData.id,
          status: "active",
        })
        .select()
        .single()

      if (tuitionError) {
        console.error("Error creating tuition:", tuitionError)
        throw tuitionError
      }

      console.log("✅ Tuition created successfully:", tuitionData)
      toast.success("Tuition created successfully!")

      // Redirect to the tuitions list or the specific tuition
      router.push("/tuitions")
    } catch (error: any) {
      console.error("❌ Error creating tuition:", error)
      toast.error(error.message || "Failed to create tuition. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <div className="container mx-auto p-4 max-w-2xl pt-16 md:pt-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="bg-background/80 backdrop-blur-sm border shadow-sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Create New Tuition
            </h1>
            <p className="text-muted-foreground">Set up a new tuition to start managing students</p>
          </div>
        </div>

        {/* Form */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-accent/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <CardTitle>Tuition Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tuition Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-foreground">
                  Tuition Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., Morning Batch - Class 10"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full"
                  required
                />
                <p className="text-xs text-muted-foreground">Choose a descriptive name to identify this tuition</p>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium text-foreground">
                  Subject <span className="text-red-500">*</span>
                </label>
                <Select value={formData.subject} onValueChange={(value) => handleInputChange("subject", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium text-foreground">
                  Tuition Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    type="text"
                    placeholder="e.g., House 123, Road 5, Dhanmondi, Dhaka"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="w-full pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">Enter the complete address where classes will be held</p>
              </div>

              {/* Teaching Days */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Teaching Days <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={day.id}
                        checked={formData.teaching_days.includes(day.id)}
                        onCheckedChange={() => handleDayToggle(day.id)}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary data-[state=checked]:to-primary/80"
                      />
                      <label
                        htmlFor={day.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {day.label}
                      </label>
                    </div>
                  ))}
                </div>
                {formData.teaching_days.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formData.teaching_days.length} day{formData.teaching_days.length > 1 ? "s" : ""} per week:{" "}
                      {formData.teaching_days
                        .map((dayId) => DAYS_OF_WEEK.find((d) => d.id === dayId)?.short)
                        .join(", ")}
                    </span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Select the days when you will conduct classes for this tuition
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-foreground">
                  Description (Optional)
                </label>
                <Textarea
                  id="description"
                  placeholder="Add details about this tuition, schedule, or any special notes..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="min-h-[100px] resize-none"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">Provide additional context about this tuition</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={
                    loading ||
                    !formData.name.trim() ||
                    !formData.subject ||
                    !formData.address.trim() ||
                    formData.teaching_days.length === 0
                  }
                  className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Tuition...
                    </>
                  ) : (
                    <>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Create Tuition
                    </>
                  )}
                </Button>
                <Link href="/dashboard">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto bg-background/80 backdrop-blur-sm"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="mt-6 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 border-blue-200/50 dark:from-blue-950/20 dark:to-cyan-950/20 dark:border-blue-800/50">
          <CardContent className="pt-6">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Quick Tips
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Use clear, descriptive names like "Evening Batch - HSC Physics"</li>
              <li>• Include complete address for easy student reference</li>
              <li>• Select all days when you plan to conduct classes</li>
              <li>• You can add students and set individual fees after creating the tuition</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}













// // app/tuitions/new/page.tsx - Fixed version
// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useUser } from "@clerk/nextjs";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
// import { supabase } from "@/lib/supabase";
// import Link from "next/link";
// import { toast } from "sonner";

// const SUBJECTS = [
//   "Mathematics",
//   "Physics", 
//   "Chemistry",
//   "Biology",
//   "English",
//   "Bangla",
//   "Economics",
//   "Accounting",
//   "ICT",
//   "General Science",
//   "Social Science",
//   "Other"
// ];

// type TuitionFormData = {
//   name: string;
//   subject: string;
//   description: string;
// };

// export default function NewTuition() {
//   const router = useRouter();
//   const { user } = useUser();
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState<TuitionFormData>({
//     name: "",
//     subject: "",
//     description: "",
//   });

//   const handleInputChange = (field: keyof TuitionFormData, value: string) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!user || !formData.name.trim() || !formData.subject) {
//       toast.error("Please fill in all required fields");
//       return;
//     }

//     setLoading(true);
//     console.log('🔍 Creating tuition for user:', user.id);

//     try {
//       // Step 1: Get the user's ID from Supabase
//       console.log('🔍 Looking up user in database...');
//       let { data: userData, error: userError } = await supabase
//         .from('users')
//         .select('id')
//         .eq('clerk_id', user.id)
//         .single();

//       if (userError) {
//         console.error('Error finding user:', userError);
        
//         // If user doesn't exist, create them first
//         if (userError.code === 'PGRST116') {
//           console.log('🔍 User not found, creating user first...');
          
//           const newUserData = {
//             clerk_id: user.id,
//             email: user.emailAddresses[0]?.emailAddress || '',
//             name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
//             role: 'tutor' as const,
//             is_active: true,
//           };

//           const { data: createdUser, error: createError } = await supabase
//             .from('users')
//             .insert(newUserData)
//             .select('id')
//             .single();

//           if (createError) {
//             throw new Error(`Failed to create user: ${createError.message}`);
//           }
          
//           console.log('✅ User created successfully');
//           userData = createdUser;
//         } else {
//           throw userError;
//         }
//       }

//       if (!userData) {
//         throw new Error("Failed to get user data");
//       }

//       console.log('🔍 Creating tuition...');

//       // Step 2: Create the tuition
//       const { data: tuitionData, error: tuitionError } = await supabase
//         .from('tuitions')
//         .insert({
//           name: formData.name.trim(),
//           subject: formData.subject,
//           description: formData.description.trim() || null,
//           tutor_id: userData.id,
//           status: 'active'
//         })
//         .select()
//         .single();

//       if (tuitionError) {
//         console.error('Error creating tuition:', tuitionError);
//         throw tuitionError;
//       }

//       console.log('✅ Tuition created successfully:', tuitionData);
//       toast.success("Tuition created successfully!");
      
//       // Redirect to the tuitions list or the specific tuition
//       router.push('/tuitions');
      
//     } catch (error: any) {
//       console.error('❌ Error creating tuition:', error);
//       toast.error(error.message || "Failed to create tuition. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto p-4 max-w-2xl">
//         {/* Header */}
//         <div className="flex items-center gap-4 mb-6">
//           <Link href="/dashboard">
//             <Button variant="ghost" size="icon">
//               <ArrowLeft className="h-4 w-4" />
//             </Button>
//           </Link>
//           <div>
//             <h1 className="text-2xl font-bold text-foreground">Create New Tuition</h1>
//             <p className="text-muted-foreground">Set up a new tuition to start managing students</p>
//           </div>
//         </div>

//         {/* Form */}
//         <Card>
//           <CardHeader>
//             <div className="flex items-center gap-2">
//               <BookOpen className="h-5 w-5 text-primary" />
//               <CardTitle>Tuition Details</CardTitle>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-6">
//               {/* Tuition Name */}
//               <div className="space-y-2">
//                 <label htmlFor="name" className="text-sm font-medium text-foreground">
//                   Tuition Name <span className="text-red-500">*</span>
//                 </label>
//                 <Input
//                   id="name"
//                   type="text"
//                   placeholder="e.g., Morning Batch - Class 10"
//                   value={formData.name}
//                   onChange={(e) => handleInputChange('name', e.target.value)}
//                   className="w-full"
//                   required
//                 />
//                 <p className="text-xs text-muted-foreground">
//                   Choose a descriptive name to identify this tuition
//                 </p>
//               </div>

//               {/* Subject */}
//               <div className="space-y-2">
//                 <label htmlFor="subject" className="text-sm font-medium text-foreground">
//                   Subject <span className="text-red-500">*</span>
//                 </label>
//                 <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select a subject" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {SUBJECTS.map((subject) => (
//                       <SelectItem key={subject} value={subject}>
//                         {subject}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Description */}
//               <div className="space-y-2">
//                 <label htmlFor="description" className="text-sm font-medium text-foreground">
//                   Description (Optional)
//                 </label>
//                 <Textarea
//                   id="description"
//                   placeholder="Add details about this tuition, schedule, or any special notes..."
//                   value={formData.description}
//                   onChange={(e) => handleInputChange('description', e.target.value)}
//                   className="min-h-[100px] resize-none"
//                   rows={4}
//                 />
//                 <p className="text-xs text-muted-foreground">
//                   Provide additional context about this tuition
//                 </p>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex flex-col sm:flex-row gap-4 pt-4">
//                 <Button 
//                   type="submit" 
//                   disabled={loading || !formData.name.trim() || !formData.subject}
//                   className="flex-1"
//                 >
//                   {loading ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       Creating Tuition...
//                     </>
//                   ) : (
//                     <>
//                       <BookOpen className="mr-2 h-4 w-4" />
//                       Create Tuition
//                     </>
//                   )}
//                 </Button>
//                 <Link href="/dashboard">
//                   <Button type="button" variant="outline" className="w-full sm:w-auto">
//                     Cancel
//                   </Button>
//                 </Link>
//               </div>
//             </form>
//           </CardContent>
//         </Card>

//         {/* Tips Card */}
//         <Card className="mt-6 bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
//           <CardContent className="pt-6">
//             <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Quick Tips</h3>
//             <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
//               <li>• Use clear, descriptive names like "Evening Batch - HSC Physics"</li>
//               <li>• You can add students after creating the tuition</li>
//               <li>• Set up fee structures for each student individually</li>
//               <li>• Use the description to note class timings or special instructions</li>
//             </ul>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }












// // // app/tuitions/new/page.tsx
// // "use client";

// // import { useState } from "react";
// // import { useRouter } from "next/navigation";
// // import { useUser } from "@clerk/nextjs";
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Textarea } from "@/components/ui/textarea";
// // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// // import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
// // import { supabase } from "@/lib/supabase";
// // import Link from "next/link";
// // import { toast } from "sonner"; // You'll need to install this: npm install sonner

// // const SUBJECTS = [
// //   "Mathematics",
// //   "Physics", 
// //   "Chemistry",
// //   "Biology",
// //   "English",
// //   "Bangla",
// //   "Economics",
// //   "Accounting",
// //   "ICT",
// //   "General Science",
// //   "Social Science",
// //   "Other"
// // ];

// // type TuitionFormData = {
// //   name: string;
// //   subject: string;
// //   description: string;
// // };

// // export default function NewTuition() {
// //   const router = useRouter();
// //   const { user } = useUser();
// //   const [loading, setLoading] = useState(false);
// //   const [formData, setFormData] = useState<TuitionFormData>({
// //     name: "",
// //     subject: "",
// //     description: "",
// //   });

// //   const handleInputChange = (field: keyof TuitionFormData, value: string) => {
// //     setFormData(prev => ({
// //       ...prev,
// //       [field]: value
// //     }));
// //   };

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
    
// //     if (!user || !formData.name.trim() || !formData.subject) {
// //       toast.error("Please fill in all required fields");
// //       return;
// //     }

// //     setLoading(true);

// //     try {
// //       // First, get the user's ID from Supabase
// //       const { data: userData, error: userError } = await supabase
// //         .from('users')
// //         .select('id')
// //         .eq('clerk_id', user.id)
// //         .single();

// //       if (userError || !userData) {
// //         throw new Error("User not found in database");
// //       }

// //       // Create the tuition
// //       const { data, error } = await supabase
// //         .from('tuitions')
// //         .insert({
// //           name: formData.name.trim(),
// //           subject: formData.subject,
// //           description: formData.description.trim() || null,
// //           tutor_id: userData.id,
// //           status: 'active'
// //         })
// //         .select()
// //         .single();

// //       if (error) throw error;

// //       toast.success("Tuition created successfully!");
// //       router.push(`/tuitions/${data.id}`);
// //     } catch (error) {
// //       console.error('Error creating tuition:', error);
// //       toast.error("Failed to create tuition. Please try again.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen bg-background">
// //       <div className="container mx-auto p-4 max-w-2xl">
// //         {/* Header */}
// //         <div className="flex items-center gap-4 mb-6">
// //           <Link href="/dashboard">
// //             <Button variant="ghost" size="icon">
// //               <ArrowLeft className="h-4 w-4" />
// //             </Button>
// //           </Link>
// //           <div>
// //             <h1 className="text-2xl font-bold text-foreground">Create New Tuition</h1>
// //             <p className="text-muted-foreground">Set up a new tuition to start managing students</p>
// //           </div>
// //         </div>

// //         {/* Form */}
// //         <Card>
// //           <CardHeader>
// //             <div className="flex items-center gap-2">
// //               <BookOpen className="h-5 w-5 text-primary" />
// //               <CardTitle>Tuition Details</CardTitle>
// //             </div>
// //           </CardHeader>
// //           <CardContent>
// //             <form onSubmit={handleSubmit} className="space-y-6">
// //               {/* Tuition Name */}
// //               <div className="space-y-2">
// //                 <label htmlFor="name" className="text-sm font-medium text-foreground">
// //                   Tuition Name <span className="text-red-500">*</span>
// //                 </label>
// //                 <Input
// //                   id="name"
// //                   type="text"
// //                   placeholder="e.g., Morning Batch - Class 10"
// //                   value={formData.name}
// //                   onChange={(e) => handleInputChange('name', e.target.value)}
// //                   className="w-full"
// //                   required
// //                 />
// //                 <p className="text-xs text-muted-foreground">
// //                   Choose a descriptive name to identify this tuition
// //                 </p>
// //               </div>

// //               {/* Subject */}
// //               <div className="space-y-2">
// //                 <label htmlFor="subject" className="text-sm font-medium text-foreground">
// //                   Subject <span className="text-red-500">*</span>
// //                 </label>
// //                 <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
// //                   <SelectTrigger>
// //                     <SelectValue placeholder="Select a subject" />
// //                   </SelectTrigger>
// //                   <SelectContent>
// //                     {SUBJECTS.map((subject) => (
// //                       <SelectItem key={subject} value={subject}>
// //                         {subject}
// //                       </SelectItem>
// //                     ))}
// //                   </SelectContent>
// //                 </Select>
// //               </div>

// //               {/* Description */}
// //               <div className="space-y-2">
// //                 <label htmlFor="description" className="text-sm font-medium text-foreground">
// //                   Description (Optional)
// //                 </label>
// //                 <Textarea
// //                   id="description"
// //                   placeholder="Add details about this tuition, schedule, or any special notes..."
// //                   value={formData.description}
// //                   onChange={(e) => handleInputChange('description', e.target.value)}
// //                   className="min-h-[100px] resize-none"
// //                   rows={4}
// //                 />
// //                 <p className="text-xs text-muted-foreground">
// //                   Provide additional context about this tuition
// //                 </p>
// //               </div>

// //               {/* Action Buttons */}
// //               <div className="flex flex-col sm:flex-row gap-4 pt-4">
// //                 <Button 
// //                   type="submit" 
// //                   disabled={loading || !formData.name.trim() || !formData.subject}
// //                   className="flex-1"
// //                 >
// //                   {loading ? (
// //                     <>
// //                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
// //                       Creating Tuition...
// //                     </>
// //                   ) : (
// //                     <>
// //                       <BookOpen className="mr-2 h-4 w-4" />
// //                       Create Tuition
// //                     </>
// //                   )}
// //                 </Button>
// //                 <Link href="/dashboard">
// //                   <Button type="button" variant="outline" className="w-full sm:w-auto">
// //                     Cancel
// //                   </Button>
// //                 </Link>
// //               </div>
// //             </form>
// //           </CardContent>
// //         </Card>

// //         {/* Tips Card */}
// //         <Card className="mt-6 bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
// //           <CardContent className="pt-6">
// //             <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Quick Tips</h3>
// //             <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
// //               <li>• Use clear, descriptive names like "Evening Batch - HSC Physics"</li>
// //               <li>• You can add students after creating the tuition</li>
// //               <li>• Set up fee structures for each student individually</li>
// //               <li>• Use the description to note class timings or special instructions</li>
// //             </ul>
// //           </CardContent>
// //         </Card>
// //       </div>
// //     </div>
// //   );
// // }