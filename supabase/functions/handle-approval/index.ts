const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const token = url.searchParams.get('token')
    const action = url.searchParams.get('action') // 'approve' or 'deny'

    if (!token || !action) {
      return new Response(
        `<html><body><h1>Invalid Request</h1><p>Missing token or action parameter.</p></body></html>`,
        { 
          headers: { ...corsHeaders, 'Content-Type': 'text/html' },
          status: 400 
        }
      )
    }

    // Initialize Supabase client with service role key for admin operations
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the approval request
    const { data: approvalRequest, error: fetchError } = await supabaseAdmin
      .from('user_approvals')
      .select('*')
      .eq('approval_token', token)
      .eq('status', 'pending')
      .single()

    if (fetchError || !approvalRequest) {
      console.error('Error fetching approval request:', fetchError)
      return new Response(
        `<html><body><h1>Invalid Token</h1><p>Approval request not found or already processed.</p></body></html>`,
        { 
          headers: { ...corsHeaders, 'Content-Type': 'text/html' },
          status: 404 
        }
      )
    }

    let result: any = { success: false }

    if (action === 'approve') {
      // Create user account in Supabase Auth
      console.log('Creating user account for:', approvalRequest.email)
      console.log('Using password:', approvalRequest.password ? 'Password provided' : 'No password')
      
      const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
        email: approvalRequest.email,
        password: approvalRequest.password,
        email_confirm: true,
        user_metadata: {
          approved_by: 'outsource.arjun@gmail.com',
          approved_at: new Date().toISOString()
        }
      })

      if (createUserError) {
        console.error('Error creating user account:', createUserError)
        console.error('Error details:', {
          message: createUserError.message,
          status: createUserError.status,
          code: createUserError.code
        })
        console.error('User data attempted:', {
          email: approvalRequest.email,
          hasPassword: !!approvalRequest.password,
          passwordLength: approvalRequest.password?.length
        })
        return new Response(
          `<html><body><h1>Error Creating User</h1><p>Failed to create user account: ${createUserError.message}</p><p>Email: ${approvalRequest.email}</p><p>Error Code: ${createUserError.code || 'Unknown'}</p><p>Please check the logs for more details.</p></body></html>`,
          { 
            headers: { ...corsHeaders, 'Content-Type': 'text/html' },
            status: 500 
          }
        )
      }

      console.log('User account created successfully:', newUser.user?.id)

      // Update approval status
      const { error: updateError } = await supabaseAdmin
        .from('user_approvals')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: 'outsource.arjun@gmail.com'
        })
        .eq('id', approvalRequest.id)

      if (updateError) {
        console.error('Error updating approval status:', updateError)
      }

      // Add to approved users table
      const { error: approvedError } = await supabaseAdmin
        .from('approved_users')
        .insert({
          email: approvalRequest.email,
          approved_by: 'outsource.arjun@gmail.com'
        })

      if (approvedError) {
        console.error('Error adding to approved users:', approvedError)
      }

      result = {
        success: true,
        email: approvalRequest.email,
        message: 'User approved and account created successfully'
      }

    } else if (action === 'deny') {
      // Update approval status to denied
      const { error: updateError } = await supabaseAdmin
        .from('user_approvals')
        .update({
          status: 'denied',
          approved_at: new Date().toISOString(),
          approved_by: 'outsource.arjun@gmail.com'
        })
        .eq('id', approvalRequest.id)

      if (updateError) {
        console.error('Error updating approval status:', updateError)
        return new Response(
          `<html><body><h1>Error</h1><p>Failed to update approval status</p></body></html>`,
          { 
            headers: { ...corsHeaders, 'Content-Type': 'text/html' },
            status: 500 
          }
        )
      }

      result = {
        success: true,
        email: approvalRequest.email,
        message: 'User access denied'
      }
    }

    const message = action === 'approve' 
      ? `✅ User ${result.email} has been approved and can now sign in!`
      : `❌ User ${result.email} has been denied access.`

    return new Response(
      `<html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
          <div style="text-align: center; background: #f0f9ff; padding: 30px; border-radius: 10px;">
            <h1 style="color: #1e40af;">${action === 'approve' ? '✅ Approved!' : '❌ Denied'}</h1>
            <p style="font-size: 18px; color: #374151;">${message}</p>
            <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px;">
              <p><strong>Email:</strong> ${result.email}</p>
              <p><strong>Action:</strong> ${action.charAt(0).toUpperCase() + action.slice(1)}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>`,
      { 
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      `<html><body><h1>Server Error</h1><p>An unexpected error occurred: ${error.message}</p></body></html>`,
      { 
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
        status: 500 
      }
    )
  }
})

async function sendApprovalEmail(userEmail: string) {
  try {
    // Create email content
    const subject = 'CodeScore Access Approved! 🎉'
    const body = `Hello!

Great news! Your access to CodeScore has been approved by Arjun Kumbakkara.

You can now sign in to CodeScore and start using AI-powered code analysis:
👉 https://profound-centaur-5f0dbe.netlify.app

What you can do with CodeScore:
✅ Get instant AI-powered code reviews
✅ Analyze Java, JavaScript, and Python code
✅ Download detailed PDF reports
✅ Track your code improvement history
✅ Share your code scores with others

Welcome to CodeScore! Start improving your code quality today.

Best regards,
The CodeScore Team
Created by Arjun Kumbakkara`

    // Create mailto link (this will work when the approval email is opened)
    const mailtoLink = `mailto:${userEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    
    // In a production environment, you would use a proper email service here
    // For now, we'll log the email content
    console.log('Approval email would be sent to:', userEmail)
    console.log('Email content:', { subject, body })
    
    return true
  } catch (error) {
    console.error('Error sending approval email:', error)
    return false
  }
}