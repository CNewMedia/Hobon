import { EyeOpenIcon } from "@sanity/icons";
import type { DocumentActionComponent } from "sanity";
import { isPreviewableSchemaType } from "@/lib/sanity/previewTypes";

export const openPreviewAction: DocumentActionComponent = (props) => {
  if (!isPreviewableSchemaType(props.type)) return null;

  return {
    label: "Open preview",
    icon: EyeOpenIcon,
    onHandle: async () => {
      try {
        const res = await fetch("/api/draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentId: props.id }),
        });

        if (!res.ok) {
          const err = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(err?.error ?? `Preview failed (${res.status})`);
        }

        const { url } = (await res.json()) as { url: string };
        window.open(url, "_blank", "noopener,noreferrer");
      } catch (err) {
        console.error("[Open preview]", err);
        // eslint-disable-next-line no-alert
        alert(
          err instanceof Error
            ? err.message
            : "Preview kon niet worden geopend. Controleer SANITY_API_READ_TOKEN en SANITY_PREVIEW_SECRET op de server.",
        );
      }
    },
  };
};
