import React, { useEffect, useState } from "react";
import { Pages } from "@/entities/Pages";
import { registerPageComponents } from "./componentRegistry";
import { PageLoader } from "@/components/PageTransition/PageLoader";

type Props = {
  page: Pages;
  children: React.ReactNode;
};

export default function PageBootstrap({ page, children }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      await registerPageComponents(page);

      if (mounted) {
        setReady(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [page.slug]);

  if (!ready) {
    return <PageLoader />;
  }

  return <>{children}</>;
}