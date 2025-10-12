# Narrate AI - Complete Project Documentation

## 🎯 Project Overview

**Narrate AI** is a voice-to-content platform that transforms spoken thoughts into engaging LinkedIn posts and articles using AI-powered transcription and content generation. Users can record their thoughts, get AI transcriptions, and generate polished content for social media.

### Core Value Proposition
- **Voice-First Content Creation**: Record thoughts naturally, get AI-generated content
- **LinkedIn Integration**: Direct posting to LinkedIn with scheduling
- **Subscription-Based**: Freemium model with trial limits and paid plans
- **AI-Powered**: Advanced transcription and content generation

---

## 🏗️ Technical Architecture

### **Frontend Stack**
- **Framework**: Next.js 15.5.4 with App Router (Turbopack)
- **UI Library**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS 4.0 with custom design system
- **State Management**: React hooks with custom hooks pattern
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Charts**: Recharts for analytics
- **Notifications**: Sonner for toast notifications

### **Backend Stack**
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with JWT tokens
- **File Storage**: Supabase Storage for audio files
- **API**: Next.js API routes with middleware
- **Rate Limiting**: Upstash Redis-based rate limiting
- **Monitoring**: Sentry for error tracking

### **External Services**
- **AI Transcription**: AssemblyAI for audio-to-text
- **Content Generation**: OpenAI GPT-4 for content creation
- **Payment Processing**: LemonSqueezy for subscriptions
- **Social Media**: LinkedIn API for posting
- **Analytics**: PostHog for user analytics

---

## 📊 Database Schema

### **Core Tables**

#### **profiles** (User Management)
```sql
- id: UUID (Primary Key)
- email: TEXT (Unique)
- full_name: TEXT (Nullable)
- avatar_url: TEXT (Nullable)
- subscription_status: TEXT (trial/active/cancelled/expired)
- subscription_id: TEXT (Nullable)
- subscription_plan: TEXT (monthly/yearly)
- subscription_end_date: TIMESTAMP (Nullable)
- trial_minutes_used: INTEGER (Default: 0)
- customer_portal_url: TEXT (Nullable)
- lemon_customer_id: TEXT (Nullable)
- cancellation_reason: TEXT (Nullable)
- cancellation_feedback: TEXT (Nullable)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### **recordings** (Audio Management)
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key → profiles.id)
- title: TEXT
- audio_url: TEXT (Supabase Storage URL)
- transcript: TEXT (Nullable)
- duration: INTEGER (Seconds)
- status: ENUM (processing/completed/failed)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### **posts** (Content Management)
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key → profiles.id)
- recording_id: UUID (Foreign Key → recordings.id, Nullable)
- title: TEXT
- content: TEXT
- status: ENUM (draft/published/archived)
- published_at: TIMESTAMP (Nullable)
- scheduled_at: TIMESTAMP (Nullable)
- linkedin_post_id: TEXT (Nullable)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### **linkedin_connections** (Social Integration)
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key → auth.users.id)
- linkedin_user_id: TEXT
- access_token: TEXT (Encrypted)
- refresh_token: TEXT (Encrypted)
- token_expires_at: TIMESTAMP
- linkedin_profile_data: JSONB
- is_active: BOOLEAN (Default: true)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### **scheduled_posts** (Content Scheduling)
```sql
- id: UUID (Primary Key)
- post_id: UUID (Foreign Key → posts.id)
- user_id: UUID (Foreign Key → auth.users.id)
- scheduled_at: TIMESTAMP
- status: ENUM (pending/processing/completed/failed/cancelled)
- linkedin_post_id: TEXT (Nullable)
- error_message: TEXT (Nullable)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### **Database Features**
- **Row Level Security (RLS)**: All tables have RLS policies
- **Indexes**: Optimized for user queries and scheduled posts
- **Triggers**: Auto-update timestamps
- **Foreign Keys**: Proper referential integrity
- **Constraints**: Data validation at database level

---

## 🔌 API Architecture

### **Authentication Endpoints**
```
POST /api/auth/signin          - User authentication
POST /api/auth/signup          - User registration
POST /api/auth/signout         - User logout
POST /api/auth/reset-password  - Password reset
```

### **Recording Endpoints**
```
GET    /api/recordings         - List user recordings
POST   /api/recordings         - Create new recording
GET    /api/recordings/[id]    - Get specific recording
PUT    /api/recordings/[id]    - Update recording
DELETE /api/recordings/[id]    - Delete recording
```

### **Post Management**
```
GET    /api/posts              - List user posts
POST   /api/posts              - Create new post
GET    /api/posts/[id]         - Get specific post
PUT    /api/posts/[id]         - Update post
DELETE /api/posts/[id]         - Delete post
```

### **Subscription Management**
```
GET    /api/subscription/status     - Get subscription status
POST   /api/subscription/portal     - Create customer portal
POST   /api/subscription/cancel     - Cancel subscription
POST   /api/subscription/feedback   - Collect cancellation feedback
```

### **LinkedIn Integration**
```
POST   /api/linkedin/post      - Post to LinkedIn
GET    /api/linkedin/test      - Test LinkedIn connection
POST   /api/linkedin/connect   - Connect LinkedIn account
```

### **Webhook Endpoints**
```
POST   /api/webhooks/lemonsqueezy  - Payment webhooks
GET    /api/cron/process-scheduled-posts - Scheduled post processing
```

---

## 🔒 Security Implementation

### **Rate Limiting**
- **General API**: 100 requests/minute
- **Authentication**: 5 requests/minute
- **LinkedIn Posting**: 10 requests/hour
- **Recording Upload**: 20 requests/hour
- **Content Generation**: 50 requests/hour
- **Subscription**: 10 requests/minute

### **Security Headers**
```typescript
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: microphone=(self)
- Content-Security-Policy: [comprehensive CSP]
```

### **Input Validation**
- **Zod Schemas**: All API routes use Zod validation
- **Type Safety**: TypeScript throughout
- **SQL Injection Protection**: Supabase ORM prevents SQL injection
- **XSS Protection**: Content sanitization and CSP headers

### **Authentication Security**
- **JWT Tokens**: Supabase handles token management
- **Row Level Security**: Database-level access control
- **Session Management**: Secure session handling
- **Password Security**: Supabase Auth handles password hashing

---

## 🚀 Scalability Considerations

### **Current Architecture Strengths**
✅ **Serverless**: Next.js API routes scale automatically  
✅ **Database**: Supabase handles connection pooling  
✅ **CDN**: Static assets served via Vercel CDN  
✅ **Rate Limiting**: Prevents abuse and ensures fair usage  
✅ **Caching**: Built-in Next.js caching strategies  

### **Potential Bottlenecks & Solutions**

#### **1. Database Performance**
**Current State**: Single Supabase instance
**Scaling Issues**: 
- Database connection limits
- Query performance with large datasets
- Storage costs for audio files

**Solutions**:
- **Database Optimization**: Add more indexes, query optimization
- **Read Replicas**: Use Supabase read replicas for analytics
- **Connection Pooling**: Implement PgBouncer for connection pooling
- **Archiving**: Archive old recordings to cold storage

#### **2. File Storage**
**Current State**: Supabase Storage for audio files
**Scaling Issues**:
- Storage costs grow with usage
- CDN costs for audio delivery
- File size limits

**Solutions**:
- **S3 Migration**: Move to AWS S3 for better pricing
- **CDN Optimization**: Use CloudFront for audio delivery
- **Compression**: Implement audio compression
- **Lifecycle Policies**: Auto-delete old files

#### **3. AI Processing**
**Current State**: Direct API calls to AssemblyAI and OpenAI
**Scaling Issues**:
- API rate limits
- Processing costs
- Queue management

**Solutions**:
- **Queue System**: Implement Redis/Bull for job queues
- **Batch Processing**: Process multiple recordings together
- **Caching**: Cache similar transcriptions
- **Fallback Providers**: Multiple AI providers for redundancy

#### **4. LinkedIn API**
**Current State**: Direct API calls to LinkedIn
**Scaling Issues**:
- LinkedIn rate limits
- Token refresh management
- Error handling

**Solutions**:
- **Queue System**: Queue LinkedIn posts
- **Retry Logic**: Implement exponential backoff
- **Token Management**: Centralized token refresh
- **Monitoring**: Track API usage and limits

### **Recommended Scaling Strategy**

#### **Phase 1: Immediate (0-1K users)**
- ✅ Current architecture is sufficient
- Monitor database performance
- Implement basic caching

#### **Phase 2: Growth (1K-10K users)**
- **Database**: Add read replicas, optimize queries
- **Storage**: Migrate to S3, implement CDN
- **Queue**: Add Redis for background jobs
- **Monitoring**: Implement comprehensive monitoring

#### **Phase 3: Scale (10K+ users)**
- **Microservices**: Split into separate services
- **Database**: Consider database sharding
- **CDN**: Global CDN for audio files
- **Load Balancing**: Multiple server instances

---

## 💰 Business Model & Monetization

### **Subscription Tiers**
- **Trial**: 5 minutes of recording time
- **Monthly**: $29/month - Unlimited recording
- **Yearly**: $290/year - Unlimited recording + priority support

### **Revenue Streams**
1. **Subscription Revenue**: Primary revenue source
2. **Usage-Based**: Potential future tier based on usage
3. **Enterprise**: Custom solutions for teams

### **Cost Structure**
- **Infrastructure**: Supabase, Vercel, external APIs
- **AI Processing**: AssemblyAI, OpenAI costs
- **Payment Processing**: LemonSqueezy fees
- **Storage**: Audio file storage costs

---

## 🔧 Development & Deployment

### **Environment Setup**
```bash
# Required Environment Variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
ASSEMBLYAI_API_KEY=your_assemblyai_api_key
LEMONSQUEEZY_WEBHOOK_SECRET=your_lemonsqueezy_webhook_secret
LEMONSQUEEZY_API_KEY=your_lemonsqueezy_api_key
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

### **Deployment**
- **Platform**: Vercel (recommended)
- **Database**: Supabase (managed PostgreSQL)
- **Storage**: Supabase Storage
- **CDN**: Vercel Edge Network
- **Monitoring**: Sentry, PostHog

### **CI/CD Pipeline**
```bash
# Build process
npm run build
npm run lint
npm run type-check

# Deployment
vercel deploy --prod
```

---

## 📈 Monitoring & Analytics

### **Error Tracking**
- **Sentry**: Application error monitoring
- **Console Logging**: Structured logging for debugging
- **Error Boundaries**: React error boundaries for graceful failures

### **User Analytics**
- **PostHog**: User behavior tracking
- **Custom Events**: Recording usage, content generation
- **Funnel Analysis**: User journey optimization

### **Performance Monitoring**
- **Vercel Analytics**: Core Web Vitals
- **Database Monitoring**: Supabase dashboard
- **API Monitoring**: Response times and error rates

---

## 🚨 Critical Issues & Recommendations

### **High Priority Issues**
1. **Database Indexing**: Add indexes for user queries
2. **Error Handling**: Improve error boundaries and user feedback
3. **Rate Limiting**: Implement more granular rate limiting
4. **Monitoring**: Add comprehensive application monitoring

### **Medium Priority Issues**
1. **Caching**: Implement Redis caching for frequently accessed data
2. **Queue System**: Add background job processing
3. **File Optimization**: Compress audio files before storage
4. **API Documentation**: Add OpenAPI/Swagger documentation

### **Low Priority Issues**
1. **Testing**: Add unit and integration tests
2. **Documentation**: Improve code documentation
3. **Performance**: Optimize bundle size and loading times
4. **Accessibility**: Improve accessibility compliance

---

## 🎯 Success Metrics

### **Technical Metrics**
- **Uptime**: 99.9% availability target
- **Response Time**: <200ms for API responses
- **Error Rate**: <1% error rate
- **Database Performance**: <100ms query response time

### **Business Metrics**
- **User Growth**: Monthly active users
- **Conversion Rate**: Trial to paid conversion
- **Churn Rate**: Monthly subscription churn
- **Revenue**: Monthly recurring revenue (MRR)

### **User Experience Metrics**
- **Recording Success Rate**: Successful recording completion
- **Transcription Accuracy**: AI transcription quality
- **Content Generation**: User satisfaction with generated content
- **LinkedIn Post Success**: Successful LinkedIn posting rate

---

## 🔮 Future Roadmap

### **Short Term (1-3 months)**
- Performance optimization
- Enhanced error handling
- Improved monitoring
- User feedback collection

### **Medium Term (3-6 months)**
- Advanced analytics dashboard
- Team collaboration features
- Mobile app development
- Advanced AI features

### **Long Term (6+ months)**
- Multi-platform posting (Twitter, Facebook)
- Advanced content templates
- Enterprise features
- API for third-party integrations

---

## 📞 Support & Maintenance

### **Technical Support**
- **Documentation**: Comprehensive API and user documentation
- **Error Tracking**: Sentry for automatic error reporting
- **Monitoring**: Real-time application monitoring
- **Backup Strategy**: Automated database backups

### **Maintenance Schedule**
- **Daily**: Monitor error rates and performance
- **Weekly**: Review usage metrics and costs
- **Monthly**: Security updates and dependency updates
- **Quarterly**: Performance optimization and scaling review

---

This documentation provides a complete overview of the Narrate AI project, including technical architecture, scalability considerations, and recommendations for handling growth. The current architecture is well-suited for initial growth, but will need optimization as user base expands.
