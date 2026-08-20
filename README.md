# Dental Consultant AI

Dental Consultant AI is a Next.js application that provides AI-powered dental consultation explanations for both Patients and Clinicians. It is designed to bridge the communication gap by providing easy-to-understand explanations for patients and technical, clinically accurate details for dental professionals.

## Features

- **Role-Based Perspectives (Personas):**
  - **Patient View:** Provides simplified, comforting explanations of dental procedures, anxiety management tips, aftercare instructions, and expected recovery timelines.
  - **Clinician View:** Provides technical breakdowns, clinical indications, contraindications, ICD codes, and material recommendations.
- **Multi-language Support:** Consultations can be generated in English, Spanish, French, and Mandarin.
- **AI Streaming:** Real-time generation of consultation responses using the Vercel AI SDK.
- **Feedback System:** Users can rate the AI responses (Thumbs up / Thumbs down) and provide written feedback.
- **Print & PDF Ready:** Easily print or save the consultation report as a PDF.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **AI Integration:** [Vercel AI SDK](https://sdk.vercel.ai/) (`@ai-sdk/react`, `@ai-sdk/google`, `@ai-sdk/groq`, `@ai-sdk/openai`)
- **Database / ORM:** [Prisma](https://www.prisma.io/) (for storing feedback and logs)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) and [Lucide Icons](https://lucide.dev/)

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Copy the `.env.example` to `.env` and fill in the necessary API keys (e.g., Database URL, AI Provider keys like Groq, Google, or OpenAI).
   ```bash
   cp .env.example .env
   ```

3. **Database Setup:**
   Run Prisma to generate the client and push the schema to your database.
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the App:**
   Open [http://localhost:3000](http://localhost:3000) with your browser to start a consultation.

## Project Structure

- `src/app/`: Next.js App Router pages and API routes (e.g., `/api/consult`, `/api/feedback`).
- `src/components/`: Reusable React components, including the main `ConsultationShell`, `PatientView`, and `ClinicianView`.
- `src/lib/`: Schemas (using Zod) and utility functions.
- `prisma/`: Prisma schema for database modeling.
- `public/`: Static assets.
