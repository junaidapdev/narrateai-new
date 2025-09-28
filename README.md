# Narrate AI

Transform your voice into engaging content with AI-powered transcription and content generation.

## Features

- 🎤 **Voice Recording**: Record your thoughts and ideas with high-quality audio capture
- 📝 **AI Transcription**: Get accurate transcriptions powered by advanced AI
- ✨ **Content Generation**: Transform transcripts into engaging posts and articles
- 📊 **Analytics**: Track your content performance with detailed insights
- 🔐 **Authentication**: Secure user authentication with Supabase
- 💳 **Subscriptions**: Flexible pricing plans for different needs

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Forms**: React Hook Form with Zod validation
- **Notifications**: Sonner
- **Icons**: Lucide React
- **Charts**: Recharts
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd narrate-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Configure your environment variables in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
ASSEMBLYAI_API_KEY=your_assemblyai_api_key
LEMONSQUEEZY_WEBHOOK_SECRET=your_lemonsqueezy_webhook_secret
LEMONSQUEEZY_API_KEY=your_lemonsqueezy_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Set up your Supabase database with the required tables (see Database Schema section)

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   │   ├── signin/
│   │   ├── signup/
│   │   └── reset-password/
│   ├── (marketing)/        # Marketing pages
│   │   ├── page.tsx       # Landing page
│   │   ├── pricing/
│   │   └── about/
│   ├── (app)/             # Protected app pages
│   │   ├── dashboard/
│   │   ├── recording/
│   │   ├── posts/
│   │   └── settings/
│   └── api/               # API routes
│       ├── auth/
│       ├── recordings/
│       ├── posts/
│       └── subscription/
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Authentication components
│   ├── recording/        # Recording components
│   ├── posts/           # Post components
│   └── layout/          # Layout components
├── lib/                  # Utility libraries
│   ├── supabase/        # Supabase configuration
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript types
│   ├── hooks/           # Custom React hooks
│   └── constants/       # App constants
└── styles/              # Global styles
```

## Database Schema

The application uses the following Supabase tables:

### Users
- `id` (uuid, primary key)
- `email` (text, unique)
- `full_name` (text, nullable)
- `avatar_url` (text, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Recordings
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to users)
- `title` (text)
- `description` (text, nullable)
- `audio_url` (text)
- `transcript` (text, nullable)
- `duration` (integer, nullable)
- `status` (enum: 'processing', 'completed', 'failed')
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Posts
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to users)
- `recording_id` (uuid, foreign key to recordings, nullable)
- `title` (text)
- `content` (text)
- `status` (enum: 'draft', 'published', 'archived')
- `published_at` (timestamp, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Subscriptions
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to users)
- `status` (enum: 'active', 'canceled', 'past_due', 'unpaid')
- `plan` (enum: 'free', 'pro', 'enterprise')
- `current_period_start` (timestamp)
- `current_period_end` (timestamp)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Features

### Authentication
- User registration and login
- Password reset functionality
- Protected routes with middleware
- User profile management

### Recording Management
- Upload audio files
- Real-time recording status
- Audio transcription
- Recording metadata

### Content Creation
- Create posts from recordings
- Draft and publish workflow
- Content editing and management
- Post archiving

### Subscription Management
- Multiple pricing tiers
- Subscription status tracking
- Billing integration with LemonSqueezy
- Usage limits and features

## API Routes

### Authentication
- `POST /api/auth/signin` - User sign in
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signout` - User sign out
- `POST /api/auth/reset-password` - Password reset

### Recordings
- `GET /api/recordings` - List user recordings
- `POST /api/recordings` - Create new recording
- `GET /api/recordings/[id]` - Get specific recording
- `PUT /api/recordings/[id]` - Update recording
- `DELETE /api/recordings/[id]` - Delete recording

### Posts
- `GET /api/posts` - List user posts
- `POST /api/posts` - Create new post
- `GET /api/posts/[id]` - Get specific post
- `PUT /api/posts/[id]` - Update post
- `DELETE /api/posts/[id]` - Delete post

### Subscription
- `GET /api/subscription` - Get user subscription
- `POST /api/subscription` - Create subscription
- `PUT /api/subscription` - Update subscription
- `POST /api/subscription/cancel` - Cancel subscription

## Development

### Code Style
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Tailwind CSS for styling

### Testing
```bash
npm run test
```

### Building for Production
```bash
npm run build
```

### Deployment
The application is ready for deployment on Vercel, Netlify, or any other Next.js-compatible platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@narrateai.com or join our Discord community.