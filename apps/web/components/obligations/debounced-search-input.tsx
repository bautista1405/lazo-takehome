"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@repo/ui/components/primitives";
import type { DebouncedSearchInputProps } from "../../interfaces/obligations";

const defaultDelayMs = 300;

export function DebouncedSearchInput({
  defaultValue = "",
  delayMs = defaultDelayMs,
  locale,
  placeholder,
}: DebouncedSearchInputProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const nextQuery = value.trim();

      params.set("locale", locale);
      params.delete("error");
      params.delete("success");

      if (nextQuery) {
        params.set("q", nextQuery);
      } else {
        params.delete("q");
      }

      if (params.toString() === searchParams.toString()) {
        return;
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, delayMs);

    return () => window.clearTimeout(timeout);
  }, [delayMs, locale, pathname, router, searchParams, value]);

  return (
    <Input
      autoComplete="off"
      name="q"
      onChange={(event) => setValue(event.target.value)}
      placeholder={placeholder}
      type="search"
      value={value}
    />
  );
}
