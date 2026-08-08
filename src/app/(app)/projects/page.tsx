import Link from 'next/link';
import { notFound } from 'next/navigation';

import { TaskForm } from '@/components/tasks/TaskForm';
import { fetchProject } from '@/lib/api/projects';
import { createClient } from '@/lib/supabase/server';

import { Board } from './Board';

/**
 * In Next.js 15 `params` is a PROMISE. In Next 14 it was a plain object.
 *
 * Copy a tutorial written in 2024 and you get `params.id is undefined`. Half
 * the Next.js answers online are still for the old version — always check.
 */
type PageProps = { params: Promise<{ id: string }> };

/**
 * TODO 9 — runs on the server before the page renders, and its result becomes
 * real <title> and <meta> tags in the HTML.
 *
 * That is what Google and WhatsApp link previews read. A client-side SPA
 * cannot do this without extra machinery.
 */
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const project = await fetchProject(supabase, id);

  return { title: project?.name ?? 'Project' };
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const project = await fetchProject(supabase, id);

  // Null means either "no such project" or "RLS said no". Both are a 404 as
  // far as the visitor is concerned — never leak the difference, or you have
  // told an attacker that the id exists.
  if (!project || !user) notFound();

  return (
    <div className="stack">
      <div>
        <Link href="/projects" className="crumb">
          ← All projects
        </Link>
        <div className="page-head">
          <h1>{project.name}</h1>
          {project.description && <p>{project.description}</p>}
        </div>
      </div>

      {/*
        The page is a server component; only these two children are client
        components. The data for the board is fetched in the browser by
        TanStack Query so that it can be cached, refetched and mutated.
      */}
      <TaskForm projectId={project.id} userId={user.id} />
      <Board projectId={project.id} />
    </div>
  );
}
