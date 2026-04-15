import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Button } from "#/components/selia/button";
import { Card, CardBody, CardHeader, CardTitle } from "#/components/selia/card";
import { Field, FieldError, FieldLabel } from "#/components/selia/field";
import { Input } from "#/components/selia/input";
import { Text, TextLink } from "#/components/selia/text";
import { Form } from "#/components/selia/form";
import z from "zod";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "#/components/selia/alert";
import { XCircleIcon } from "lucide-react";
import { eq } from "drizzle-orm";
import { db } from "#/database/db";
import { usersTable } from "#/database/schema";
import bcrypt from "bcryptjs";
import { useAppSession } from "#/lib/session";

const signUpInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUp = createServerFn({ method: "POST" })
  .inputValidator(signUpInputSchema)
  .handler(async ({ data }) => {
    const existingEmail = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, data.email),
    });

    if (existingEmail) {
      return {
        error: "Email already exists. Please use a different email.",
      };
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const [newUser] = await db
      .insert(usersTable)
      .values({
        name: data.name,
        email: data.email,
        password: hashedPassword,
      })
      .returning();

    const session = await useAppSession();
    await session.update({
      userId: newUser.id,
    });

    throw redirect({
      to: "/",
    });
  });

export const Route = createFileRoute("/_guest/register")({
  component: RouteComponent,
});

function RouteComponent() {
  const signUpFn = useServerFn(signUp);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    try {
      setLoading(true);
      const response = await signUpFn({
        data: {
          name: formData.get("name") as string,
          email: formData.get("email") as string,
          password: formData.get("password") as string,
        },
      });
      if (response?.error) {
        setError(response.error);
        return;
      }
    } catch (error) {
      setError("Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card className="w-full">
      <CardHeader align="center">
        <CardTitle>Create an account</CardTitle>
      </CardHeader>
      <CardBody className="flex flex-col gap-5">
        {error && (
          <Alert variant="danger" className="mb-4">
            <XCircleIcon className="mt-1" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Form onSubmit={handleSubmit}>
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your Name"
              required
            />
            <FieldError match="valueMissing">Name is required</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your Email"
              required
            />
            <FieldError match="valueMissing">Email is required</FieldError>
            <FieldError match="typeMismatch">Email is invalid</FieldError>
          </Field>
          <Field>
            <div className="flex items-center">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <TextLink href="#" className="ml-auto">
                Forgot password?
              </TextLink>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
            />
            <FieldError match="valueMissing">Password is required</FieldError>
          </Field>
          <Button
            type="submit"
            variant="primary"
            block
            size="lg"
            progress={loading}
          >
            Sign In
          </Button>
          <Text className="text-center">
            Already have an account?{" "}
            <TextLink render={<Link to="/login">Sign in</Link>}>
              Sign in
            </TextLink>
          </Text>
        </Form>
      </CardBody>
    </Card>
  );
}
