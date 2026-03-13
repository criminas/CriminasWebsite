import { httpAction, query } from "./_generated/server";
import { api } from "./_generated/api";

export const getServiceStatusesAction = httpAction(async (ctx, request) => {
  const statuses = await ctx.runQuery(api.status.getServiceStatuses);
  return new Response(JSON.stringify(statuses), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
});

export const getServiceStatuses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("serviceStatuses").collect();
  },
});
