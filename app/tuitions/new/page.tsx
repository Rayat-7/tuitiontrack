// app/tuitions/new/page.tsx - Fixed version
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { toast } from "sonner";

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
  "Other"
];

type TuitionFormData = {
  name: string;
  subject: string;
  description: string;
};

export default function NewTuition() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TuitionFormData>({
    name: "",
    subject: "",
    description: "",
  });

  const handleInputChange = (field: keyof TuitionFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !formData.name.trim() || !formData.subject) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    console.log('🔍 Creating tuition for user:', user.id);

    try {
      // Step 1: Get the user's ID from Supabase
      console.log('🔍 Looking up user in database...');
      let { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', user.id)
        .single();

      if (userError) {
        console.error('Error finding user:', userError);
        
        // If user doesn't exist, create them first
        if (userError.code === 'PGRST116') {
          console.log('🔍 User not found, creating user first...');
          
          const newUserData = {
            clerk_id: user.id,
            email: user.emailAddresses[0]?.emailAddress || '',
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
            role: 'tutor' as const,
            is_active: true,
          };

          const { data: createdUser, error: createError } = await supabase
            .from('users')
            .insert(newUserData)
            .select('id')
            .single();

          if (createError) {
            throw new Error(`Failed to create user: ${createError.message}`);
          }
          
          console.log('✅ User created successfully');
          userData = createdUser;
        } else {
          throw userError;
        }
      }

      if (!userData) {
        throw new Error("Failed to get user data");
      }

      console.log('🔍 Creating tuition...');

      // Step 2: Create the tuition
      const { data: tuitionData, error: tuitionError } = await supabase
        .from('tuitions')
        .insert({
          name: formData.name.trim(),
          subject: formData.subject,
          description: formData.description.trim() || null,
          tutor_id: userData.id,
          status: 'active'
        })
        .select()
        .single();

      if (tuitionError) {
        console.error('Error creating tuition:', tuitionError);
        throw tuitionError;
      }

      console.log('✅ Tuition created successfully:', tuitionData);
      toast.success("Tuition created successfully!");
      
      // Redirect to the tuitions list or the specific tuition
      router.push('/tuitions');
      
    } catch (error: any) {
      console.error('❌ Error creating tuition:', error);
      toast.error(error.message || "Failed to create tuition. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create New Tuition</h1>
            <p className="text-muted-foreground">Set up a new tuition to start managing students</p>
          </div>
        </div>

        {/* Form */}
        <Card>
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
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Choose a descriptive name to identify this tuition
                </p>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium text-foreground">
                  Subject <span className="text-red-500">*</span>
                </label>
                <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
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

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-foreground">
                  Description (Optional)
                </label>
                <Textarea
                  id="description"
                  placeholder="Add details about this tuition, schedule, or any special notes..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="min-h-[100px] resize-none"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Provide additional context about this tuition
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={loading || !formData.name.trim() || !formData.subject}
                  className="flex-1"
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
                  <Button type="button" variant="outline" className="w-full sm:w-auto">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="mt-6 bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
          <CardContent className="pt-6">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Quick Tips</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Use clear, descriptive names like "Evening Batch - HSC Physics"</li>
              <li>• You can add students after creating the tuition</li>
              <li>• Set up fee structures for each student individually</li>
              <li>• Use the description to note class timings or special instructions</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}












// // app/tuitions/new/page.tsx
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
// import { toast } from "sonner"; // You'll need to install this: npm install sonner

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

//     try {
//       // First, get the user's ID from Supabase
//       const { data: userData, error: userError } = await supabase
//         .from('users')
//         .select('id')
//         .eq('clerk_id', user.id)
//         .single();

//       if (userError || !userData) {
//         throw new Error("User not found in database");
//       }

//       // Create the tuition
//       const { data, error } = await supabase
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

//       if (error) throw error;

//       toast.success("Tuition created successfully!");
//       router.push(`/tuitions/${data.id}`);
//     } catch (error) {
//       console.error('Error creating tuition:', error);
//       toast.error("Failed to create tuition. Please try again.");
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