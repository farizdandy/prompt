import { InputGroup, InputGroupAddon } from "#/components/selia/input-group";
import { Input } from "#/components/selia/input";
import { Text } from "#/components/selia/text";
import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "./selia/button";
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";

const Route = getRouteApi("/_auth");

export function PromptSearch() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    setSearchValue(search.query || "");
  }, [search.query]);

  const handleSearch = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = event.currentTarget.query.value;
    navigate({
      to: "/",
      search: {
        query: query ? query : undefined,
      },
    });
  };
  return (
    <form className="mb-8" onSubmit={handleSearch}>
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <Input
          placeholder="Search prompts..."
          name="query"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <InputGroupAddon align="end">
          <Button type="submit" variant="secondary">
            Search{" "}
          </Button>
        </InputGroupAddon>
      </InputGroup>
      {search.query && (
        <Text className="mt-2 text-base text-muted-foreground">
          Showing results for "{search.query}"
          <Link to="/" className="ml-2 underline" search={{ query: undefined }}>
            Clear Search
          </Link>
        </Text>
      )}
    </form>
  );
}
