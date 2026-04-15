import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "#/components/selia/alert-dialog";
import { Button } from "#/components/selia/button";
import { useDeleteStore } from "#/stores/delete-store";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import z from "zod";
import { toastManager } from "./selia/toast";
import { db } from "#/database/db";
import { promptsTable } from "#/database/schema";
import { and, eq } from "drizzle-orm";
import { redirect, useRouter } from "@tanstack/react-router";
import { authMiddleware } from "#/middleware/auth-middleware";

const deletePromptInputSchema = z.object({
  promptId: z.uuid(),
});

const deletePrompt = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(deletePromptInputSchema)
  .handler(async ({ data, context }) => {
    const { user } = context;

    await db
      .delete(promptsTable)
      .where(
        and(
          eq(promptsTable.id, data.promptId),
          eq(promptsTable.userId, user.id),
        ),
      );

    throw redirect({
      to: "/",
    });
  });

export function DeleteDialog() {
  const deletePromptFn = useServerFn(deletePrompt);
  const beingDeleted = useDeleteStore((state) => state.beingDeleted);
  const setBeingDeleted = useDeleteStore((state) => state.setBeingDeleted);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!beingDeleted) return;
    try {
      setLoading(true);
      await deletePromptFn({ data: { promptId: beingDeleted.id } });
      toastManager.add({
        title: "Success",
        description: "Prompt deleted successfully.",
        type: "success",
      });
    } catch (error) {
      toastManager.add({
        title: "Error",
        description: "Failed to delete prompt. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
      setBeingDeleted(null);
    }
  };

  return (
    <AlertDialog
      open={!!beingDeleted}
      onOpenChange={() => setBeingDeleted(null)}
    >
      <AlertDialogPopup>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Prompt</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogBody>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <strong>"{beingDeleted?.title}"</strong>?
          </AlertDialogDescription>
        </AlertDialogBody>
        <AlertDialogFooter>
          <AlertDialogClose>Cancel</AlertDialogClose>
          <Button variant="danger" onClick={handleDelete} progress={loading}>
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  );
}
