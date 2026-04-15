import { authenticateUser } from "#/auth";
import { Alert, AlertDescription, AlertTitle } from "#/components/selia/alert";
import { Button } from "#/components/selia/button";
import { Card, CardBody, CardHeader, CardTitle } from "#/components/selia/card";
import { Field, FieldError, FieldLabel } from "#/components/selia/field";
import { Form } from "#/components/selia/form";
import { Input } from "#/components/selia/input";
import { Text, TextLink } from "#/components/selia/text";
import { useAppSession } from "#/lib/session";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { XCircleIcon } from "lucide-react";
import { useState } from "react";
import z from "zod";

const loginInputSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

const login = createServerFn({ method: "POST" })
  .inputValidator(loginInputSchema)
  .handler(async ({ data }) => {
    const authUser = await authenticateUser(data.email, data.password);

    if (!authUser) {
      return {
        error: "Invalid credentials",
      };
    }

    const session = await useAppSession();
    await session.update({
      userId: authUser.id,
    });

    throw redirect({
      to: "/",
    });
  });

export const Route = createFileRoute("/_guest/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const loginFn = useServerFn(login);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    try {
      setLoading(true);
      const response = await loginFn({
        data: {
          email: formData.get("email") as string,
          password: formData.get("password") as string,
        },
      });
      if (response.error) {
        setError(response.error);
      }
    } catch (error) {
      setError("Failed to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader align="center">
        <CardTitle>Sign in to your account</CardTitle>
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
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
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
            Login{" "}
          </Button>
          <Text className="text-center">
            Don't have an account?{" "}
            <TextLink render={<Link to="/register">Sign up</Link>}>
              Sign up
            </TextLink>
          </Text>
        </Form>
      </CardBody>
    </Card>
  );
}
