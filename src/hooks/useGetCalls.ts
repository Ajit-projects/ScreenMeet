"use client";

import { useUser } from "@clerk/nextjs";
import {
  Call,
  useStreamVideoClient,
} from "@stream-io/video-react-sdk";
import { useQuery } from "@tanstack/react-query";

export default function useGetCalls() {
  const { user } = useUser();
  const client = useStreamVideoClient();

  const {
    data: calls = [],
    isLoading,
  } = useQuery({
    queryKey: ["stream-calls", user?.id],

    enabled: !!client && !!user?.id,

    staleTime: 60 * 1000,

    gcTime: 5 * 60 * 1000,

    queryFn: async () => {
      const { calls } = await client!.queryCalls({
        sort: [
          {
            field: "starts_at",
            direction: -1,
          },
        ],

        filter_conditions: {
          starts_at: {
            $exists: true,
          },

          $or: [
            {
              created_by_user_id: user!.id,
            },

            {
              members: {
                $in: [user!.id],
              },
            },
          ],
        },

        watch: false,
      });

      return calls;
    },
  });

  const now = new Date();

  return {
    calls,

    endedCalls: calls.filter((call: Call) => {
      const start = call.state.startsAt;
      const end = call.state.endedAt;

      return (
        (start && new Date(start) < now) ||
        !!end
      );
    }),

    upcomingCalls: calls.filter((call: Call) => {
      const start = call.state.startsAt;

      return (
        start &&
        new Date(start) > now
      );
    }),

    liveCalls: calls.filter((call: Call) => {
      const start = call.state.startsAt;
      const end = call.state.endedAt;

      return (
        start &&
        new Date(start) < now &&
        !end
      );
    }),

    isLoading,
  };
}