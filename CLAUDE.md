# n8n Workflow Builder

This project enables Claude to build high-quality n8n workflows using the n8n MCP server and n8n skills.

## Environment

- **n8n Instance**: n8n Cloud
- **MCP Server**: n8n-mcp (czlonkowski/n8n-mcp)
- **Skills**: n8n-skills (czlonkowski/n8n-skills)

## Available MCP Tools

### Documentation & Discovery

| Tool | Purpose |
|------|---------|
| `tools_documentation` | Access MCP tool documentation |
| `search_nodes` | Full-text search across 1,084 nodes (filter by core/community/verified) |
| `get_node` | Retrieve node details (minimal/standard/full modes) |
| `validate_node` | Validate node configuration |
| `validate_workflow` | Complete workflow validation including AI Agent checks |
| `search_templates` | Search 2,709 templates (by keyword/nodes/task/metadata) |
| `get_template` | Retrieve complete workflow JSON from templates |

### Workflow Management

| Tool | Purpose |
|------|---------|
| `n8n_create_workflow` | Create new workflows |
| `n8n_get_workflow` | Retrieve existing workflows |
| `n8n_update_workflow` | Full workflow update |
| `n8n_update_partial_workflow` | Partial workflow update |
| `n8n_delete_workflow` | Delete workflows |
| `n8n_list_workflows` | List all workflows |
| `n8n_validate_workflow` | Validate before deployment |

### Execution Management

| Tool | Purpose |
|------|---------|
| `n8n_test_workflow` | Test/trigger workflows |
| `n8n_list_executions` | List execution history |
| `n8n_get_execution` | Get execution details |
| `n8n_delete_execution` | Delete execution records |

## Available Skills

These skills activate automatically based on context:

1. **n8n Expression Syntax** - Correct `{{}}` patterns and variable access
2. **n8n MCP Tools Expert** - Effective use of MCP server tools
3. **n8n Workflow Patterns** - 5 proven architectural approaches
4. **n8n Validation Expert** - Interpret and resolve validation errors
5. **n8n Node Configuration** - Operation-aware node setup
6. **n8n Code JavaScript** - JavaScript in Code nodes
7. **n8n Code Python** - Python with limitations awareness

## Workflow Building Process

### 1. Understand Requirements
- Clarify the workflow's purpose and triggers
- Identify required integrations and data flow
- Determine error handling needs

### 2. Search Templates First
```
search_templates -> Find similar workflows
get_template -> Get workflow JSON as starting point
```

### 3. Research Nodes
```
search_nodes -> Find appropriate nodes
get_node -> Get configuration details
```

### 4. Build Incrementally
- Start with trigger node
- Add nodes one at a time
- Validate after each addition

### 5. Validate Before Deployment
```
validate_workflow -> Check for errors
Fix any issues -> Re-validate
```

### 6. Test
```
n8n_test_workflow -> Run with test data
Verify outputs -> Adjust as needed
```

## Safety Rules

- **NEVER edit production workflows directly** - Always create copies
- **NEVER deploy without validation** - Use `validate_workflow` first
- **NEVER skip testing** - Always test with realistic data
- **NEVER use default values blindly** - Configure parameters explicitly

## Quality Standards

### Before Creating
- Search templates for existing patterns
- Understand all required node configurations
- Plan error handling strategy

### During Building
- Validate nodes as you add them
- Use proper n8n expression syntax
- Follow established workflow patterns

### Before Deployment
- Run `validate_workflow` with strict profile
- Test with representative data
- Verify error handling works

## Workflow Patterns

Use these 5 proven patterns as architectural foundations:

1. **Webhook Processing** - External triggers -> Process -> Respond
2. **HTTP API Integration** - Fetch data -> Transform -> Store/Send
3. **Database Operations** - Query -> Process -> Update
4. **AI Workflows** - Input -> AI processing -> Output handling
5. **Scheduled Tasks** - Cron trigger -> Batch process -> Report

## Expression Syntax Reference

```javascript
// Access input data
{{ $json.fieldName }}

// Access previous node output
{{ $('NodeName').item.json.field }}

// Access all items from a node
{{ $('NodeName').all() }}

// Conditional logic
{{ $json.status === 'active' ? 'yes' : 'no' }}

// Date/time
{{ $now.toISO() }}
{{ $today.format('yyyy-MM-dd') }}
```

## Common Mistakes to Avoid

- Using expressions inside Code nodes (use variables instead)
- Forgetting `$json.body` for webhook data access
- Not handling empty/null values
- Skipping validation before deployment
- Editing production workflows directly

---

# N8N to App Builder

Convert n8n workflows into production-ready Next.js web applications.

## Project Goal

Transform n8n workflows into standalone web apps with proper front-ends, deployed automatically via GitHub → Vercel.

## Workflow

### Phase 1: n8n Workflow Optimization
- Review existing n8n workflow structure
- Ensure proper webhook intake configuration (POST/GET endpoints)
- Validate data input/output schema
- Test response format for front-end consumption
- Document expected payload structure

### Phase 2: Front-End Development
- Build Next.js + React app locally
- Create forms/UI matching workflow inputs
- Implement API routes to call n8n webhooks
- Handle responses and display results
- Test end-to-end locally

### Phase 3: Deployment Pipeline
- Push to GitHub repository
- Connect to Vercel for auto-deployment
- Configure environment variables (webhook URLs)
- Test production deployment

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18+
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Version Control**: GitHub
- **Backend**: n8n workflows (webhook endpoints)

## Project Structure

```
/
├── app/                    # Next.js app directory
│   ├── api/               # API routes (proxy to n8n)
│   ├── components/        # React components
│   └── page.tsx           # Main app page
├── public/                # Static assets
├── .env.local            # Local environment variables
├── .env.example          # Environment template
├── next.config.js        # Next.js configuration
├── tailwind.config.js    # Tailwind configuration
├── package.json          # Dependencies
└── README.md             # App-specific documentation
```

## Environment Variables

Required for each environment (dev/staging/prod):

```env
# n8n Webhook URLs
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/...
N8N_WEBHOOK_SECRET=optional-secret-token

# App Configuration
NEXT_PUBLIC_APP_NAME=Your App Name
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## MCP Tools Available

- **n8n MCP**: View/modify workflows, nodes, configurations, templates
- **GitHub MCP**: Push changes, manage repositories
- **Front-end Designer Skill**: UI/UX optimization
- **n8n Skill**: Workflow-specific operations

## Development Workflow

1. **Start new app**: Create repo from this template structure
2. **Configure n8n**: Optimize workflow for app integration
3. **Build locally**: `npm run dev` and iterate
4. **Test integration**: Verify n8n ↔ front-end communication
5. **Deploy**: Push to GitHub → auto-deploys to Vercel
6. **Iterate**: Changes to GitHub automatically update Vercel

## Key Principles

- **Keep it simple**: One app per n8n workflow
- **Environment separation**: Different webhook URLs for dev/prod
- **n8n handles logic**: Front-end is UI layer only
- **Auto-deployment**: GitHub push = Vercel update
- **Clean structure**: Organized, minimal, maintainable

## Before Starting Each App

1. Identify which n8n workflow to convert
2. Document the workflow's input/output schema
3. Verify webhook endpoint is production-ready
4. Choose app name and create GitHub repo
5. Set up Vercel project linked to repo

## Common Patterns

### n8n Webhook Setup
- Use Production webhook URLs (not test URLs)
- Return JSON responses with consistent structure
- Include error handling in workflow
- Set appropriate HTTP status codes

### Front-End API Pattern
```typescript
// app/api/workflow/route.ts
export async function POST(request: Request) {
  const data = await request.json();
  const response = await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response;
}
```

### Form → API → n8n → Display
1. User fills form in React component
2. Submit calls `/api/workflow`
3. API route proxies to n8n webhook
4. n8n processes and returns response
5. Display results to user

## Success Criteria

- n8n workflow accepts and returns data correctly
- Front-end successfully communicates with n8n
- App deployed on Vercel with proper env vars
- GitHub → Vercel auto-deployment working
- Clean, maintainable code structure
