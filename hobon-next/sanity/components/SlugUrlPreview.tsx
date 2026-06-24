"use client";

import { Box, Stack, Text } from "@sanity/ui";
import type { ObjectFieldProps, SlugValue } from "sanity";
import { useFormValue } from "sanity";
import type { Locale } from "@/lib/i18n/config";
import { isLocale } from "@/lib/i18n/config";
import { resolveInternalHref } from "@/lib/sanity/resolveInternalHref";
import { SITE_ORIGIN } from "@/lib/siteUrl";

function resolvePublicUrl(
  documentType: string | undefined,
  language: string | undefined,
  slug: string | undefined,
): { hint: string; url: string | null } {
  if (!language) {
    return { hint: "Publieke URL: nog geen taal ingesteld", url: null };
  }
  if (!isLocale(language)) {
    return { hint: "Publieke URL: kan pad niet bepalen", url: null };
  }
  if (!slug) {
    return { hint: "Publieke URL: nog geen slug ingesteld", url: null };
  }

  const href = resolveInternalHref(language as Locale, { _type: documentType, slug });
  if (!href) {
    return { hint: "Publieke URL: kan pad niet bepalen", url: null };
  }

  return { hint: "", url: `${SITE_ORIGIN}${href}` };
}

export function SlugUrlPreview(props: ObjectFieldProps<SlugValue>) {
  const language = useFormValue(["language"]) as string | undefined;
  const documentType = useFormValue(["_type"]) as string | undefined;
  const slug = props.value?.current?.trim() || undefined;
  const { hint, url } = resolvePublicUrl(documentType, language, slug);

  return (
    <Stack space={3}>
      {props.renderDefault(props)}
      <Box paddingTop={1}>
        <Text size={1} muted>
          {url ? (
            <>
              Publieke URL:{" "}
              <a href={url} target="_blank" rel="noopener noreferrer">
                {url}
              </a>{" "}
              ↗
            </>
          ) : (
            hint
          )}
        </Text>
      </Box>
    </Stack>
  );
}
