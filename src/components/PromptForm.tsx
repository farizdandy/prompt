import {
  Field,
  FieldControl,
  FieldError,
  FieldLabel,
} from "#/components/selia/field";
import { Form } from "#/components/selia/form";
import { Input } from "#/components/selia/input";
import { Textarea } from "#/components/selia/textarea";
import { Button } from "#/components/selia/button";
import { useEffect, useState } from "react";

export default function PromptForm({
  onSubmit,
  data,
  loading,
}: React.ComponentProps<typeof Form> & {
  loading?: boolean;
  data?: { title: string; content: string };
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    setTitle(data?.title || "");
    setContent(data?.content || "");
  }, [data]);

  return (
    <Form onSubmit={onSubmit}>
      <Field>
        <FieldLabel htmlFor="title">Title</FieldLabel>
        <Input
          id="title"
          name="title"
          placeholder="Enter the prompt title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <FieldError match="valueMissing">Title is required</FieldError>
      </Field>
      <Field>
        <FieldLabel htmlFor="content">Content</FieldLabel>
        <FieldControl
          render={
            <Textarea
              id="content"
              name="content"
              placeholder="Enter the prompt content"
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          }
        />
        <FieldError match="valueMissing">Content is required</FieldError>
      </Field>
      <Button type="submit" progress={loading}>
        {data?.title ? "Update Prompt" : "Create Prompt"}
      </Button>
    </Form>
  );
}
