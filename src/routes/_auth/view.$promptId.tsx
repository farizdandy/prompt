import { Button } from "#/components/selia/button";
import { Heading } from "#/components/selia/heading";
import { Separator } from "#/components/selia/separator";
import { Text } from "#/components/selia/text";
import { db } from "#/database/db";
import { promptsTable } from "#/database/schema";
import { authMiddleware } from "#/middleware/auth-middleware";
import { useDeleteStore } from "#/stores/delete-store";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { ArrowLeftIcon } from "lucide-react";
import z from "zod";

const getPromptInpuSchema = z.object({
  promptId: z.uuid(),
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

export const Route = createFileRoute("/_auth/view/$promptId")({
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
        title: loaderData?.prompt ? loaderData.prompt.title : "Prompt Detail",
      },
    ],
  }),
});

function RouteComponent() {
  const params = Route.useParams();
  const { prompt } = Route.useLoaderData();
  const setBeingDeleted = useDeleteStore((state) => state.setBeingDeleted);

  return (
    <>
      <header className="flex items-center justify-between">
        <Heading>Prompt Detail</Heading>
        <Button nativeButton={false} variant="outline" render={<Link to="/" />}>
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back{" "}
        </Button>
      </header>
      <Separator className="my-4" />
      <Heading size="sm" level={2} className="text-dimmed">
        Prompt Title
      </Heading>
      <Text className="text-2xl font-medium mb-8">{prompt?.title} </Text>
      <Heading size="sm" level={2} className="text-dimmed">
        Prompt Content
      </Heading>
      <Text className="mb-8">{prompt?.content}</Text>
      <Heading size="sm" level={2} className="text-dimmed">
        Created At{" "}
      </Heading>
      <Text className="mb-8">{prompt?.createdAt.toLocaleDateString()}</Text>
      <Heading size="sm" level={2} className="text-dimmed">
        Updated At{" "}
      </Heading>
      <Text>{prompt?.updatedAt.toLocaleDateString()}</Text>
      <Separator className="my-4" />
      <footer className="flex items-center gap-2">
        <Button
          render={
            <Link to="/edit/$promptId" params={{ promptId: params.promptId }} />
          }
          variant="outline"
        >
          Edit Prompt
        </Button>
        <Button
          variant="danger"
          onClick={() =>
            setBeingDeleted({ id: params.promptId, title: "Prompt Title" })
          }
        >
          Delete Prompt
        </Button>
      </footer>
    </>
  );
}
