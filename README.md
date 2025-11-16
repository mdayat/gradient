# Quizzy

A simple quiz platform.

## Tech Stack

- **Framework:** Next.js
- **Database:** Neon (PostgreSQL)
- **ORM:** Prisma
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Math Rendering:** KaTeX
- **Deployment:** Vercel

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/mdayat/gradient
    cd gradient
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**

    - Create a `.env` file in the project root.
    - Add your database connection string:
      ```.env
      DATABASE_URL=YOUR_DATABASE_CONNECTION_STRING
      ```

4.  **Run database migrations:**

    ```bash
    pnpm exec prisma migrate apply
    ```

5.  **Seed the database:**

    ```bash
    pnpm seed
    ```

6.  **Run the development server:**
    ```bash
    pnpm dev
    ```

The application will be available at `http://localhost:3000`.
