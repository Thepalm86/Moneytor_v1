# CLAUDE.md - Moneytor V2 Project Instructions

## Project Overview

**Moneytor V2** is a production-ready fintech application built with Next.js 14, TypeScript, Supabase, and modern React patterns. This is a comprehensive personal finance management system with transaction tracking, budgets, saving goals, and analytics.

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Authentication, Row Level Security)
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Notifications**: Sonner (toast notifications)
- **Development**: ESLint, Prettier, Husky pre-commit hooks

## Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── forms/            # Form components
│   ├── charts/           # Chart components
│   ├── layout/           # Layout components
│   ├── transactions/     # Transaction-specific components
│   ├── budgets/          # Budget-specific components
│   └── goals/            # Goal-specific components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configurations
│   ├── supabase/         # Supabase client and services
│   ├── validations/      # Zod schemas
│   └── utils/            # Utility functions
└── types/                # TypeScript type definitions
```

## Development Guidelines

### Code Patterns to Follow

1. **File Organization**: Follow the established pattern - each feature has its own folder with schemas, services, hooks, and components
2. **TypeScript**: Use strict typing with Zod schemas for validation
3. **Error Handling**: Use consistent error handling patterns with try/catch and proper error messages
4. **State Management**: Use TanStack Query for server state, local state for UI state
5. **Forms**: Use React Hook Form with Zod validation for all forms
6. **Components**: Follow shadcn/ui patterns, use proper prop interfaces

### Established Patterns

#### Backend Service Pattern

```typescript
// lib/supabase/[feature].ts
export async function getFeatures(
  userId: string
): Promise<{ data: Feature[]; error: string | null }> {
  try {
    const { data, error } = await supabase.from('features').select('*').eq('user_id', userId)

    if (error) return { data: [], error: error.message }
    return { data, error: null }
  } catch (err) {
    return { data: [], error: 'Failed to fetch features' }
  }
}
```

#### Hooks Pattern

```typescript
// hooks/use-[feature].ts
export function useFeatures() {
  const { user } = useUser()

  return useQuery({
    queryKey: ['features', user?.id],
    queryFn: () => getFeatures(user!.id),
    enabled: !!user?.id,
  })
}

export function useCreateFeature() {
  const queryClient = useQueryClient()
  const { user } = useUser()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: FeatureInput) => createFeature(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] })
      toast({ title: 'Feature created successfully' })
    },
    onError: error => {
      toast({
        variant: 'destructive',
        title: 'Failed to create feature',
        description: error.message,
      })
    },
  })
}
```

#### Form Component Pattern

```typescript
// components/forms/[feature]-form.tsx
export function FeatureForm({ feature, onSuccess }: FeatureFormProps) {
  const form = useForm<FeatureInput>({
    resolver: zodResolver(featureSchema),
    defaultValues: feature || {
      name: '',
      // ... other fields
    },
  })

  const createMutation = useCreateFeature()
  const updateMutation = useUpdateFeature()

  const onSubmit = async (data: FeatureInput) => {
    if (feature) {
      await updateMutation.mutateAsync({ id: feature.id, ...data })
    } else {
      await createMutation.mutateAsync(data)
    }
    onSuccess?.()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Form fields */}
        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {isLoading ? 'Saving...' : (feature ? 'Update' : 'Create')}
        </Button>
      </form>
    </Form>
  )
}
```

## Current Implementation Status

### ✅ Completed Features (Phase 1-3)

- **Phase 1**: Project setup, authentication, database schema
- **Phase 2**: Transactions, categories, dashboard, analytics
- **Phase 3**: Budgets, saving goals, comprehensive reports

### Key Features Implemented

1. **Authentication**: Login/register with Supabase Auth
2. **Transactions**: Full CRUD with filtering, sorting, charts
3. **Categories**: Management with analytics
4. **Budgets**: Creation, tracking, progress monitoring
5. **Saving Goals**: Goal setting, progress tracking, contributions
6. **Dashboard**: Overview cards, charts, recent activity
7. **Analytics**: Comprehensive charts and insights

## Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Run Prettier

# Database
npm run db:reset     # Reset Supabase database
npm run db:seed      # Seed database with sample data
```

## Important Conventions

### Database Naming

- Tables: snake_case (e.g., `saving_goals`, `budget_categories`)
- Columns: snake_case (e.g., `user_id`, `created_at`)
- Foreign keys: `[table]_id` (e.g., `category_id`, `user_id`)

### Code Naming

- Components: PascalCase (e.g., `TransactionForm`, `GoalCard`)
- Files: kebab-case (e.g., `transaction-form.tsx`, `use-goals.ts`)
- Functions: camelCase (e.g., `getTransactions`, `createBudget`)
- Types: PascalCase (e.g., `Transaction`, `BudgetInput`)

### Git Workflow

- **⚠️ IMPORTANT**: Always ask for user permission before pushing to GitHub
- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`
- Create feature branches: `feature/[feature-name]`
- Run linting and tests before committing

## Key Files to Reference

- `docs/FINTECH-APP-IMPLEMENTATION.md` - Complete implementation guide
- `docs/FINTECH-APP-STRATEGY.md` - Architecture and strategy decisions
- `src/lib/supabase/client.ts` - Supabase configuration
- `src/lib/validations/` - All Zod schemas
- `database-schema-final.sql` - Complete database schema

## Testing Strategy

- **Unit Tests**: Utilities and business logic (Vitest)
- **Component Tests**: UI components (Testing Library)
- **E2E Tests**: Critical user flows (Playwright)
- **Form Validation**: React Hook Form + Zod validation

## Security Considerations

- Row Level Security (RLS) enabled on all tables
- User authentication required for all operations
- Input validation with Zod schemas
- CSRF protection via Supabase
- Environment variables for sensitive configuration

## Performance Optimizations

- TanStack Query for efficient data fetching and caching
- React Server Components where appropriate
- Optimistic updates for better UX
- Proper error boundaries and loading states
- Image optimization with Next.js

## Deployment

- **Platform**: Vercel (recommended)
- **Database**: Supabase (hosted)
- **Environment**: Production environment variables required
- **Monitoring**: Built-in analytics and error tracking

## Support and Maintenance

- Follow established patterns when adding new features
- Maintain TypeScript strict mode
- Keep dependencies updated regularly
- Monitor performance and user experience
- Regular security audits and updates

## Claude-Specific Instructions

### When Working on This Project:

1. **Always read existing code first** - Use Read tool to understand current implementations before making changes
2. **Follow established patterns** - Look at existing components, hooks, and services for consistency
3. **Use TypeScript strictly** - Ensure all new code has proper typing
4. **Test thoroughly** - Run linting and type checking before completing tasks
5. **Ask before major changes** - Confirm architectural decisions with the user
6. **Never commit without permission** - Always ask before pushing to GitHub
7. **Reference documentation** - Use the docs/ folder for architectural guidance
8. **Follow naming conventions** - Maintain consistency with existing codebase

### Preferred Tools and Approaches:

- **File Reading**: Use Read tool for understanding existing implementations
- **Code Changes**: Use Edit or MultiEdit for modifications
- **New Features**: Follow the established service → hook → component pattern
- **Database Changes**: Reference the database schema file first
- **Styling**: Use Tailwind CSS with shadcn/ui component patterns
- **State Management**: TanStack Query for server state, React state for UI

### Quality Standards:

- All new components should have proper TypeScript interfaces
- Follow the established error handling patterns
- Use consistent naming conventions throughout
- Ensure mobile-responsive design
- Implement proper loading states and error boundaries
- Add toast notifications for user feedback

---

**Last Updated**: January 2025  
**Project Phase**: Phase 3 Complete (Ready for Phase 4 - Enhancement & Polish)
