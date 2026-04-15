import { getCurrentUser, logout } from "#/auth";
import { Button } from "#/components/selia/button";
import { Separator } from "#/components/selia/separator";
import { Text } from "#/components/selia/text";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async () => {
    const user = await getCurrentUser();
    if (!user) {
      throw redirect({
        to: "/login",
      });
    }

    return { user };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const logoutFn = useServerFn(logout);
  const { user } = Route.useRouteContext();

  return (
    <div>
      <nav className="flex items-center justify-between">
        <div className="font-semibold">Prompat Manager</div>
        <div className="flex items-center gap-2">
          <Text>Hello, {user?.name}!</Text>
          <Button variant="danger" size="sm" onClick={() => logoutFn()}>
            Logout
          </Button>
        </div>
      </nav>
      <Separator className="my-4" />
      <Outlet />
    </div>
  );
}
