"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import React from "react";

function ConvexClerkProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = React.useMemo(
    () =>
      new ConvexReactClient(
        process.env.NEXT_PUBLIC_CONVEX_URL!
      ),
    []
  );

  return (
    <ClerkProvider>
      <ConvexProviderWithClerk
        client={client}
        useAuth={useAuth}
      >
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

export default ConvexClerkProvider;