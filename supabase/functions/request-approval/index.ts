import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, reason, password } = await req.json()

    if (!email || !reason || !password) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email, reason, and password are required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Insert approval request
    const { data: approvalData, error: approvalError } = await supabaseClient
      .from('user_approvals')
      .insert({
        email,
        reason,
        password,
        password,
        status: 'pending'
      })
      .select()
      .single()

    if (approvalError) {
      if (approvalError.code === '23505') { // Unique constraint violation
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'An approval request for this email already exists.' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        )
      }
      throw approvalError
    }

    // Send approval email to admin
    await sendApprovalRequestEmail(email, reason, approvalData.approval_token)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Approval request submitted successfully. You will receive an email once approved.' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function sendApprovalRequestEmail(userEmail: string, reason: string, approvalToken: string) {
  try {
    const baseUrl = 'https://ewxajqoqjrumdcqksmto.supabase.co'
    const approveUrl = `${baseUrl}/functions/v1/handle-approval?token=${approvalToken}&action=approve`
    const denyUrl = `${baseUrl}/functions/v1/handle-approval?token=${approvalToken}&action=deny`

    const subject = 'CodeScore Access Request - Approval Needed'
    const body = `Hello Arjun,

A new user has requested access to CodeScore:

📧 Email: ${userEmail}
📝 Reason: ${reason}
🕒 Requested: ${new Date().toLocaleString()}

Please review and take action:

✅ APPROVE ACCESS: ${approveUrl}

❌ DENY ACCESS: ${denyUrl}

Note: Clicking "Approve" will automatically:
- Grant the user access to CodeScore
- Send them a welcome email with login instructions
- Add them to the approved users list

Best regards,
CodeScore System`

    // Send email notification (in production, you would use a proper email service)
    // For now, we'll use a simple HTTP request to trigger email
    try {
      const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: 'default_service',
          template_id: 'template_approval',
          user_id: 'your_emailjs_user_id',
          template_params: {
            to_email: 'outsource.arjun@gmail.com',
            subject: subject,
            message: body,
            user_email: userEmail,
            reason: reason,
            approve_url: approveUrl,
            deny_url: denyUrl
          }
        })
      });
      
      console.log('Email notification sent:', emailResponse.status);
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Continue execution even if email fails
    }
    
    // Log the approval request details for manual processing if needed
    console.log('=== NEW APPROVAL REQUEST ===');
    console.log('Email:', userEmail);
    console.log('Reason:', reason);
    console.log('Approve URL:', approveUrl);
    console.log('Deny URL:', denyUrl);
    console.log('Timestamp:', new Date().toISOString());
    console.log('============================');
    
    return true
  } catch (error) {
    console.error('Error sending approval request email:', error)
    return false
  }
}