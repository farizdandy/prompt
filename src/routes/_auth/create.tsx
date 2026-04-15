import PromptForm from "#/components/PromptForm";
import { Button } from "#/components/selia/button";
import { Heading } from "#/components/selia/heading";
import { Separator } from "#/components/selia/separator";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { ArrowLeftIcon, XCircleIcon } from "lucide-react";
import { z } from "zod";
import { db } from "#/database/db";
import { promptsTable } from "#/database/schema";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "#/components/selia/alert";
import { authMiddleware } from "#/middleware/auth-middleware";

const CreatePromptSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

const createPrompt = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(CreatePromptSchema)
  .handler(async ({ data, context }) => {
    const { user } = context;

    await db.insert(promptsTable).values({
      title: data.title,
      content: data.content,
      userId: user.id,
    });

    throw redirect({
      to: "/",
    });
  });

export const Route = createFileRoute("/_auth/create")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: "Create Prompt",
      },
    ],
  }),
});

function RouteComponent() {
  const createPromptFn = useServerFn(createPrompt);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    try {
      setLoading(true);
      await createPromptFn({
        data: {
          title: formData.get("title") as string,
          content: formData.get("content") as string,
        },
      });
    } catch (error) {
      setError("Failed to create prompt. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="flex items-center justify-between">
        <Heading>Create Prompt</Heading>
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
      <PromptForm onSubmit={handleSubmit} loading={loading} />
    </>
  );
}
