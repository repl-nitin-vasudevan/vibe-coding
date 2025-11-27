# Todo Calendar App

A modern, full-stack todo list application with calendar integration built using Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

### Todo List Management
- **Create todos** with text description, date, and time
- **Edit todos** inline with save/cancel options
- **Delete todos** with confirmation
- **Automatic sorting** by scheduled date/time
- **Dropdown menu** for edit/delete actions on each todo item

### Calendar Integration
- **Monthly view** - Traditional calendar grid with date selection
- **Weekly view** - 7-day view with task count badges
- **View toggle** - Switch between monthly and weekly views
- **Date selection** - Click any date to see scheduled todos
- **Task display** - Shows todos for selected date below the calendar, ordered by time
- **Today button** - Quick navigation back to current date
- **Navigation arrows** - Browse through weeks/months

### Drag and Drop Scheduling
- **Drag unscheduled todos** - Grab any todo without a date from the todo list
- **Drop on calendar** - Drop onto any calendar day to schedule the todo
- **Visual feedback** - Hovered dates highlight with a ring, scale effect, and shadow
- **Drop hint** - "Drop on a date to schedule" message appears during drag
- **Works in both views** - Drag and drop works in monthly and weekly calendar views

### User Interface
- **Resizable panels** - Drag the divider between todo list and calendar to resize (1/4 to 1/2 of screen width)
- **Responsive design** - Stacks vertically on mobile, side-by-side on desktop
- **Beautiful styling** - Clean, modern UI with hover effects and transitions
- **Real-time updates** - Changes in todo list instantly reflect in calendar view

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Database**: SQLite with [Prisma ORM](https://www.prisma.io/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/repl-nitin-vasudevan/vibe-coding.git
   cd vibe-coding/todo-calendar
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up the database**:

   Create a `.env` file in the root directory (if not exists):
   ```env
   DATABASE_URL="file:./dev.db"
   ```

4. **Generate Prisma client and run migrations**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Seed the database** (optional - starts with empty todo list):
   ```bash
   npx prisma db seed
   ```

## Running the Application

### Development Server

Start the development server:
```bash
npm run dev
```

The application will be available at:
- **URL**: [http://localhost:3000](http://localhost:3000)

### Production Build

Build for production:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Project Structure

```
todo-calendar/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seed file
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── todos/
│   │   │       ├── route.ts       # GET, POST endpoints
│   │   │       └── [id]/
│   │   │           └── route.ts   # PUT, DELETE endpoints
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Home page
│   ├── components/
│   │   ├── ui/            # shadcn/ui components
│   │   ├── AppContent.tsx      # Main app wrapper with TodoProvider
│   │   ├── CalendarView.tsx    # Calendar component (monthly/weekly)
│   │   ├── ResizableLayout.tsx # Resizable panel layout
│   │   └── TodoList.tsx        # Todo list component
│   ├── context/
│   │   └── TodoContext.tsx     # Shared state management
│   └── lib/
│       ├── prisma.ts      # Prisma client singleton
│       └── utils.ts       # Utility functions
├── .env                   # Environment variables
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/todos` | Fetch all todos (sorted by scheduledAt) |
| POST | `/api/todos` | Create a new todo |
| PUT | `/api/todos/[id]` | Update an existing todo |
| DELETE | `/api/todos/[id]` | Delete a todo |

### Request/Response Examples

**Create Todo (POST /api/todos)**
```json
// Request
{
  "text": "Team meeting",
  "scheduledAt": "2024-01-15T14:00:00"
}

// Response
{
  "id": "clx123...",
  "text": "Team meeting",
  "scheduledAt": "2024-01-15T14:00:00.000Z",
  "completed": false,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

## Usage

1. **Adding a Todo**:
   - Enter task description in the text field
   - Select date and time
   - Click "Add" button

2. **Editing a Todo**:
   - Click the three-dot menu on any todo item
   - Select "Edit"
   - Modify the text, date, or time
   - Click "Save" (or "Cancel" to discard changes)

3. **Deleting a Todo**:
   - Click the three-dot menu on any todo item
   - Select "Delete"

4. **Viewing Todos on Calendar**:
   - Click any date on the calendar
   - Todos for that date appear below the calendar, sorted by time

5. **Switching Calendar Views**:
   - Use the "Month" / "Week" toggle buttons above the calendar

6. **Resizing Panels**:
   - Hover over the divider line between panels
   - Drag left or right to resize (min: 1/4, max: 1/2 of screen)

7. **Scheduling via Drag and Drop**:
   - Create a todo without setting a date
   - Grab the todo by its drag handle (grip icon on the left)
   - Drag it over to the calendar - dates will highlight as you hover
   - Drop on the desired date to schedule the todo

## Database Schema

```prisma
model Todo {
  id          String   @id @default(cuid())
  text        String
  scheduledAt DateTime
  completed   Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open Prisma Studio (database GUI) |

## License

MIT
