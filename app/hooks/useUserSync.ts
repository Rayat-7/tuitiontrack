// hooks/useUserSync.ts - Improved version with debugging
import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

export function useUserSync() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !user) {
        console.log('🔍 UserSync: Waiting for user to load...');
        return;
      }

      console.log('🔍 UserSync: Starting sync for user:', user.id);

      try {
        // Step 1: Check if user exists
        console.log('🔍 UserSync: Checking if user exists in Supabase...');
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('clerk_id', user.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('❌ UserSync: Error fetching user:', fetchError);
          return;
        }

        if (!existingUser) {
          console.log('🔍 UserSync: User not found, creating new user...');
          
          // Prepare user data
          const userData = {
            clerk_id: user.id,
            email: user.emailAddresses[0]?.emailAddress || '',
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.emailAddresses[0]?.emailAddress || 'User',
            phone: user.phoneNumbers[0]?.phoneNumber || null,
            role: 'tutor' as const,
            is_active: true,
          };

          console.log('🔍 UserSync: Attempting to insert:', userData);

          // Step 2: Create new user
          const { data, error: insertError } = await supabase
            .from('users')
            .insert(userData)
            .select()
            .single();

          if (insertError) {
            console.error('❌ UserSync: Error creating user:', insertError);
            console.error('❌ UserSync: Error details:', {
              message: insertError.message,
              details: insertError.details,
              hint: insertError.hint,
              code: insertError.code
            });
          } else {
            console.log('✅ UserSync: User created successfully:', data);
          }
        } else {
          console.log('✅ UserSync: User already exists:', existingUser.name);
          
          // Step 3: Update existing user if needed
          const updatedName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
          const updatedEmail = user.emailAddresses[0]?.emailAddress || '';
          
          if (existingUser.name !== updatedName || existingUser.email !== updatedEmail) {
            console.log('🔍 UserSync: Updating user info...');
            
            const { error: updateError } = await supabase
              .from('users')
              .update({
                name: updatedName || existingUser.name,
                email: updatedEmail || existingUser.email,
                updated_at: new Date().toISOString(),
              })
              .eq('clerk_id', user.id);

            if (updateError) {
              console.error('❌ UserSync: Error updating user:', updateError);
            } else {
              console.log('✅ UserSync: User updated successfully');
            }
          }
        }
      } catch (error) {
        console.error('❌ UserSync: Unexpected error:', error);
      }
    };

    syncUser();
  }, [user, isLoaded]);

  return { user, isLoaded };
}






// // hooks/useUserSync.ts
// import { useEffect } from 'react';
// import { useUser } from '@clerk/nextjs';
// import { supabase } from '@/lib/supabase';

// export function useUserSync() {
//   const { user, isLoaded } = useUser();

//   useEffect(() => {
//     const syncUser = async () => {
//       if (!isLoaded || !user) return;

//       try {
//         // Check if user exists in Supabase
//         const { data: existingUser, error: fetchError } = await supabase
//           .from('users')
//           .select('*')
//           .eq('clerk_id', user.id)
//           .single();

//         if (fetchError && fetchError.code !== 'PGRST116') {
//           console.error('Error fetching user:', fetchError);
//           return;
//         }

//         if (!existingUser) {
//           // Create new user in Supabase
//           const { data, error: insertError } = await supabase
//             .from('users')
//             .insert({
//               clerk_id: user.id,
//               email: user.emailAddresses[0]?.emailAddress || '',
//               name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.emailAddresses[0]?.emailAddress || 'User',
//               phone: user.phoneNumbers[0]?.phoneNumber || null,
//               role: 'tutor', // Default role
//               is_active: true,
//             })
//             .select()
//             .single();

//           if (insertError) {
//             console.error('Error creating user:', insertError);
//           } else {
//             console.log('User synced successfully:', data);
//           }
//         } else {
//           // Update existing user if needed
//           const updatedName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
//           const updatedEmail = user.emailAddresses[0]?.emailAddress || '';
          
//           if (existingUser.name !== updatedName || existingUser.email !== updatedEmail) {
//             const { error: updateError } = await supabase
//               .from('users')
//               .update({
//                 name: updatedName || existingUser.name,
//                 email: updatedEmail || existingUser.email,
//                 updated_at: new Date().toISOString(),
//               })
//               .eq('clerk_id', user.id);

//             if (updateError) {
//               console.error('Error updating user:', updateError);
//             }
//           }
//         }
//       } catch (error) {
//         console.error('Error in user sync:', error);
//       }
//     };

//     syncUser();
//   }, [user, isLoaded]);

//   return { user, isLoaded };
// }