import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const LoginForm = () => {
  const [memberNumber, setMemberNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Starting login process for member:', memberNumber);
      
      // First, verify member exists
      const { data: members, error: memberError } = await supabase
        .from('members')
        .select('id, member_number')
        .eq('member_number', memberNumber)
        .limit(1);

      if (memberError) {
        console.error('Member verification error:', memberError);
        throw memberError;
      }

      if (!members || members.length === 0) {
        console.error('Member not found');
        throw new Error('Member not found');
      }

      const member = members[0];
      console.log('Member found:', member);

      const email = `${memberNumber.toLowerCase()}@temp.com`;
      const password = memberNumber;

      // Try to sign in first
      console.log('Attempting to sign in');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // If sign in fails due to invalid credentials, try to sign up
      if (signInError && signInError.message === 'Invalid login credentials') {
        console.log('Sign in failed, attempting to create account');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              member_number: memberNumber,
            }
          }
        });

        if (signUpError && signUpError.message !== 'User already registered') {
          console.error('Sign up error:', signUpError);
          throw signUpError;
        }

        // Try signing in again after signup attempt
        console.log('Attempting final sign in');
        const { data: finalSignInData, error: finalSignInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (finalSignInError) {
          console.error('Final sign in error:', finalSignInError);
          throw finalSignInError;
        }

        if (finalSignInData.user) {
          // Update member with auth_user_id if not already set
          const { error: updateError } = await supabase
            .from('members')
            .update({ auth_user_id: finalSignInData.user.id })
            .eq('id', member.id)
            .is('auth_user_id', null);

          if (updateError) {
            console.error('Error updating member with auth_user_id:', updateError);
            // Don't throw here as the login was successful
          }
        }
      } else if (signInError) {
        console.error('Sign in error:', signInError);
        throw signInError;
      } else if (signInData.user) {
        // Update member with auth_user_id if not already set
        const { error: updateError } = await supabase
          .from('members')
          .update({ auth_user_id: signInData.user.id })
          .eq('id', member.id)
          .is('auth_user_id', null);

        if (updateError) {
          console.error('Error updating member with auth_user_id:', updateError);
          // Don't throw here as the login was successful
        }
      }

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });

      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dashboard-card rounded-lg shadow-lg p-8 mb-12">
      <form onSubmit={handleLogin} className="space-y-6 max-w-md mx-auto">
        <div>
          <label htmlFor="memberNumber" className="block text-sm font-medium text-dashboard-text mb-2">
            Member Number
          </label>
          <Input
            id="memberNumber"
            type="text"
            value={memberNumber}
            onChange={(e) => setMemberNumber(e.target.value)}
            placeholder="Enter your member number"
            className="w-full"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-dashboard-accent1 hover:bg-dashboard-accent1/90"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;