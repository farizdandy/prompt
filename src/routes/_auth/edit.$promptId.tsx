import PromptForm from "#/components/PromptForm";
import { Button } from "#/components/selia/button";
import { Heading } from "#/components/selia/heading";
import { Separator } from "#/components/selia/separator";
import { db } from "#/database/db";
import { promptsTable } from "#/database/schema";
import {
  createFileRoute,
  Link,
  notFound,
  redirect,
} from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { ArrowLeftIcon, XCircleIcon } from "lucide-react";
import { useState } from "react";
import z from "zod";
import { Alert, AlertDescription, AlertTitle } from "#/components/selia/alert";
import { authMiddleware } from "#/middleware/auth-middleware";

const getPromptInpuSchema = z.object({
  promptId: z.uuid(),
});

const updatePromptInputSchema = z.object({
  promptId: z.uuid(),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

const getPrompt = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(getPromptInpuSchema)
  .handler(async ({ data, context }) => {
    const { user } = context;
    const prompt = await db.query.promptsTable.findFirst({
      where: and(
        eq(promptsTable.id, data.promptId),
        eq(promptsTable.userId, user.id),
      ),
    });

    return prompt;
  });

const updatePrompt = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(updatePromptInputSchema)
  .handler(async ({ data, context }) => {
    const { user } = context;
    await db
      .update(promptsTable)
      .set({ title: data.title, content: data.content })
      .where(
        and(
          eq(promptsTable.id, data.promptId),
          eq(promptsTable.userId, user.id),
        ),
      );

    throw redirect({
      to: "/view/$promptId",
      params: { promptId: data.promptId },
    });
  });

export const Route = createFileRoute("/_auth/edit/$promptId")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const prompt = await getPrompt({ data: { promptId: params.promptId } });

    if (!prompt) {
      throw notFound();
    }

    return { prompt };
  },
  notFoundComponent: () => (
    <div className="flex flex-col items-center justify-center h-screen">
      <Heading level={1}>Prompt Not Found</Heading>
      <Link to="/">Back</Link>
    </div>
  ),
  errorComponent: () => (
    <div className="flex flex-col items-center justify-center h-screen">
      <Heading level={1}>An error occurred</Heading>
      <Link to="/">Back</Link>
    </div>
  ),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.prompt
          ? `Edit - ${loaderData.prompt.title}`
          : "Edit Prompt",
      },
    ],
  }),
});

function RouteComponent() {
  const params = Route.useParams();
  const { prompt } = Route.useLoaderData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const updatePromptFn = useServerFn(updatePrompt);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    try {
      setLoading(true);
      await updatePromptFn({
        data: {
          promptId: params.promptId,
          title: formData.get("title") as string,
          content: formData.get("content") as string,
        },
      });
    } catch (error) {
      setError("Failed to update prompt. Please try again.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      <header className="flex items-center justify-between">
        <Heading>Edit Prompt {params.promptId}</Heading>
        <Button nativeButton={false} variant="outline" render={<Link to="/" />}>
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back{" "}
        </Button>
      </header>
      <Separator className="my-4" />
      {error && (
        <Alert variant="danger" className="mb-4">
          <XCircleIcon className="mt-1" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <PromptForm
        onSubmit={handleSubmit}
        loading={loading}
        data={{ title: prompt?.title, content: prompt?.content }}
      />
    </>
  );
}
