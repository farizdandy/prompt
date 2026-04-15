import { Button } from "#/components/selia/button";
import { Heading } from "#/components/selia/heading";
import {
  Item,
  ItemAction,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "#/components/selia/item";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuTrigger,
} from "#/components/selia/menu";
import { Separator } from "#/components/selia/separator";
import { Stack } from "#/components/selia/stack";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  EllipsisVerticalIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useDeleteStore } from "#/stores/delete-store";
import { createServerFn } from "@tanstack/react-start";
import { db } from "#/database/db";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { promptsTable } from "#/database/schema";

import z from "zod";
import { PromptSearch } from "#/components/PromptSearch";
import { authMiddleware } from "#/middleware/auth-middleware";

const getPromptsInputSchema = z.object({
  query: z.string().optional(),
});

const getPrompts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(getPromptsInputSchema)
  .handler(async ({ data, context }) => {
    const { user } = context;

    const prompts = await db.query.promptsTable.findMany({
      where: and(
        eq(promptsTable.userId, user.id),
        data.query
          ? or(
              ilike(promptsTable.title, `%${data.query}%`),
              ilike(promptsTable.content, `%${data.query}%`),
            )
          : undefined,
      ),
      orderBy: [desc(promptsTable.createdAt)],
    });

    return prompts;
  });

export const Route = createFileRoute("/_auth/")({
  component: App,
  validateSearch: (
    search: Record<string, unknown>,
  ): {
    query?: string;
  } => {
    return {
      query: (search.query as string) || undefined,
    };
  },
  loaderDeps: ({ search: { query } }) => ({
    query,
  }),
  loader: async ({ deps }) => {
    const prompts = await getPrompts({ data: { query: deps.query } });
    return { prompts };
  },
  head: () => ({
    meta: [
      {
        title: "Prompt Manager",
      },
    ],
  }),
});

function App() {
  const user = Route.useRouteContext();
  console.log("User:", user);
  const setBeingDeleted = useDeleteStore((state) => state.setBeingDeleted);
  const { prompts } = Route.useLoaderData();

  return (
    <>
      <header className="flex items-center justify-between">
        <Heading>Welcome to the App</Heading>
        <Button
          nativeButton={false}
          render={<Link to="/create" />}
          variant="outline"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Create Prompt
        </Button>
      </header>
      <Separator className="my-4" />
      <PromptSearch />
      <Stack>
        {prompts.map((prompt) => {
          return (
            <Item key={prompt.id}>
              <ItemContent>
                <ItemTitle>{prompt.title}</ItemTitle>
                <ItemDescription>
                  {prompt.content.length > 100
                    ? prompt.content.slice(0, 100) + "..."
                    : prompt.content}
                </ItemDescription>
              </ItemContent>
              <ItemAction>
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={
                    <Link
                      to="/view/$promptId"
                      params={{ promptId: prompt.id }}
                    />
                  }
                >
                  View
                </Button>
                <Menu>
                  <MenuTrigger
                    render={
                      <Button variant="outline" size="sm">
                        <EllipsisVerticalIcon />
                      </Button>
                    }
                  />
                  <MenuPopup>
                    <MenuItem
                      render={
                        <Link
                          to="/edit/$promptId"
                          params={{ promptId: prompt.id }}
                        />
                      }
                    >
                      <PencilIcon />
                      Edit
                    </MenuItem>
                    <MenuItem
                      className="text-danger"
                      onClick={() =>
                        setBeingDeleted({ id: prompt.id, title: prompt.title })
                      }
                    >
                      <Trash2Icon className="text-danger" />
                      Delete
                    </MenuItem>
                  </MenuPopup>
                </Menu>
              </ItemAction>
            </Item>
          );
        })}
      </Stack>
    </>
  );
}
