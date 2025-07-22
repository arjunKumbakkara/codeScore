# CodeScore - AI-Powered Code Review Application

A modern, production-ready code review application powered by DeepSeek AI and built with React, TypeScript, and Supabase. CodeScore provides comprehensive code analysis for Java, JavaScript, Python, and SQL queries with detailed scoring and optimization recommendations.

Demo: Check it out at:

Watch a demo : [Watch](https://screenrec.com/share/PvxoUN6dcE)
[CodeScore-Link]( https://tinyurl.com/codescore)

## 🏗️ Architecture Overview

### Frontend Architecture (React + TypeScript)

```
src/
├── components/           # React components
│   ├── Header.tsx       # Navigation and authentication
│   ├── AuthModal.tsx    # User authentication modal
│   ├── CodeInput.tsx    # Code submission interface
│   ├── SQLInput.tsx     # SQL query submission interface
│   ├── ReviewResult.tsx # Display AI analysis results
│   ├── ReviewHistory.tsx# User's review history
│   ├── AdminPanel.tsx   # Admin approval management
│   ├── ShareModal.tsx   # Share review reports
│   ├── AboutSection.tsx # Application information
│   └── CodeSafetySection.tsx # Privacy and security info
├── hooks/               # Custom React hooks
│   ├── useAuth.ts      # Authentication state management
│   └── useCleanup.ts   # Automatic data cleanup
├── services/           # External API integrations
│   └── deepseek.ts     # DeepSeek AI API integration
├── lib/               # Utility libraries
│   └── supabase.ts    # Supabase client configuration
└── types/             # TypeScript type definitions
    └── index.ts       # Application interfaces
```

### Backend Architecture (Supabase + Edge Functions)

```
supabase/
├── functions/                    # Serverless Edge Functions
│   ├── request-approval/        # Handle user access requests
│   ├── handle-approval/         # Process admin approvals
│   └── get-user-emails/         # Fetch user email mappings
└── migrations/                  # Database schema migrations
    └── *.sql                   # Database table definitions
```

## 🔧 Technical Implementation

### Frontend Logic Flow

#### 1. Authentication System
```typescript
// User authentication with approval workflow
const { user, signIn, signUp } = useAuth();

// New users must request approval
if (!user) {
  // Show approval request form
  // Submit to request-approval Edge Function
}
```

#### 2. Code Review Process
```typescript
// Code submission flow
const handleCodeSubmit = async (code: string, language: string) => {
  // 1. Validate user authentication
  if (!user) return showAuthModal();
  
  // 2. Send to DeepSeek AI for analysis
  const review = await reviewCode(code, language);
  
  // 3. Save to database with user association
  await supabase.from('code_reviews').insert({
    user_id: user.id,
    code_content: code,
    review_result: review,
    language
  });
  
  // 4. Display results to user
  setCurrentReview(review);
};
```

#### 3. SQL Analysis with Production Context
```typescript
// SQL review with real production data
const handleSQLSubmit = async (query: string, tableStructures: string, dataVolume: string) => {
  // Combines user query with:
  // - Complete table schemas (CREATE TABLE statements)
  // - Real production data volumes
  // - Index definitions
  // - Performance metrics
  
  const review = await reviewCode(query, 'sql', tableStructures, dataVolume);
};
```

### Backend Logic Flow

#### 1. User Approval Workflow
```typescript
// request-approval Edge Function
export default async function(req: Request) {
  const { email, reason, password } = await req.json();
  
  // 1. Store approval request in database
  await supabase.from('user_approvals').insert({
    email, reason, password, status: 'pending'
  });
  
  // 2. Generate approval token
  // 3. Send notification to admin
  // 4. Return success response
}
```

#### 2. Admin Approval Process
```typescript
// handle-approval Edge Function
export default async function(req: Request) {
  const { token, action } = getParams(req.url);
  
  if (action === 'approve') {
    // 1. Create user account in Supabase Auth
    const { user } = await supabaseAdmin.auth.admin.createUser({
      email, password, email_confirm: true
    });
    
    // 2. Update approval status
    await supabase.from('user_approvals')
      .update({ status: 'approved' })
      .eq('approval_token', token);
    
    // 3. Add to approved users list
    await supabase.from('approved_users').insert({ email });
  }
}
```

#### 3. AI Integration Logic
```typescript
// DeepSeek API integration
export const reviewCode = async (code: string, language: string, context?: string) => {
  const prompt = language === 'sql' 
    ? buildSQLAnalysisPrompt(code, context)
    : buildCodeReviewPrompt(code, language);
  
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
    body: JSON.stringify({
      model: 'deepseek-coder',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 2000
    })
  });
  
  return response.choices[0].message.content;
};
```

## 🗄️ Database Schema

### Core Tables

#### `code_reviews` - Stores all code analysis results
```sql
CREATE TABLE code_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  code_content text NOT NULL,
  review_result text NOT NULL,
  language text NOT NULL DEFAULT 'javascript',
  filename text,
  table_structures text,  -- For SQL context
  data_volume text,       -- For SQL context
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### `user_approvals` - Manages access requests
```sql
CREATE TABLE user_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  reason text,
  password text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  approval_token uuid DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  approved_by text DEFAULT 'outsource.arjun@gmail.com'
);
```

#### `approved_users` - Tracks approved users
```sql
CREATE TABLE approved_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  approved_at timestamptz DEFAULT now(),
  approved_by text DEFAULT 'outsource.arjun@gmail.com'
);
```

### Security Implementation

#### Row Level Security (RLS)
```sql
-- Users can only access their own code reviews
CREATE POLICY "Users can read own code reviews" ON code_reviews
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admin can manage all approval requests
CREATE POLICY "Admin can manage approvals" ON user_approvals
  FOR ALL TO authenticated
  USING (jwt() ->> 'email' = 'outsource.arjun@gmail.com');
```

## 🔄 Data Flow Diagrams

### User Registration Flow
```
User Request → request-approval Function → Database Storage → Admin Notification
                                                    ↓
Admin Action → handle-approval Function → Create Auth User → Update Status
```

### Code Review Flow
```
Code Submission → Authentication Check → DeepSeek AI API → Database Storage → Display Results
                                              ↓
                                    Production Context (SQL only)
                                    - Table Schemas
                                    - Data Volumes
                                    - Index Information
```

### Admin Management Flow
```
Admin Panel → Fetch Requests → Display Interface → Approval Action → Edge Function → User Creation
```

## 🚀 Key Features Implementation

### 1. **AI-Powered Analysis**
- Integrates with DeepSeek's `deepseek-coder` model
- Context-aware prompts for different languages
- Production-specific SQL analysis with real data volumes

### 2. **Secure User Management**
- Approval-based registration system
- Row-level security for data isolation
- Admin-only approval interface

### 3. **Comprehensive SQL Analysis**
- Real production table schemas
- Actual data volumes and performance metrics
- Index usage analysis
- Performance optimization recommendations

### 4. **Data Privacy & Cleanup**
- Automatic cleanup of old reviews (7+ days)
- User-specific data isolation
- Secure data transmission

### 5. **Export & Sharing**
- PDF report generation with html2canvas + jsPDF
- Shareable review links
- Professional report formatting

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- Supabase account
- DeepSeek API key

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key
```

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Database Setup
1. Create Supabase project
2. Run migrations in `supabase/migrations/`
3. Deploy Edge Functions
4. Configure environment variables

## 📊 Performance Considerations

### Frontend Optimizations
- Component-based architecture for reusability
- Custom hooks for state management
- Lazy loading for large components
- Efficient re-rendering with React best practices

### Backend Optimizations
- Edge Functions for serverless scalability
- Database indexes for query performance
- Row-level security for data isolation
- Automatic cleanup for storage management

### AI Integration Optimizations
- Context-aware prompts for better results
- Error handling for API failures
- Rate limiting considerations
- Cost-effective token usage

## 🔒 Security Features

### Authentication Security
- Supabase Auth integration
- Email verification
- Secure password handling
- Admin-only approval system

### Data Security
- Row-level security policies
- Encrypted data transmission
- User data isolation
- Automatic data cleanup

### API Security
- Environment variable protection
- CORS configuration
- Input validation
- Error message sanitization

## 📈 Monitoring & Analytics

### Application Metrics
- User registration requests
- Code review volume
- AI API usage
- Error rates and performance

### Database Monitoring
- Query performance
- Storage usage
- User activity patterns
- Cleanup effectiveness

---

## 🤝 Contributing

This application was created by **Arjun Kumbakkara** as a comprehensive code review platform. The architecture demonstrates modern full-stack development practices with AI integration, secure user management, and production-ready features.

### Contact
- **Creator**: Arjun Kumbakkara
- **Email**: outsource.arjun@gmail.com
- **GitHub**: [arjunkumbakkara.github.io](https://arjunkumbakkara.github.io)
- **Medium**: [@arjunkumbakkara](https://www.medium.com/@arjunkumbakkara)

---

*Built with React, TypeScript, Supabase, and DeepSeek AI*
