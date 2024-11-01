import type { APIRoute } from "astro";
import { generateRoomId } from "../../utils/prayer-id";

export const GET: APIRoute = async () => {
  const roomId = generateRoomId();

  return new Response(JSON.stringify({ roomId }), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  });
};
