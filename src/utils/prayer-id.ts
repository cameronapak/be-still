const adjectives = ["peaceful", "quiet", "serene", "gentle", "calm"];
const nouns = ["garden", "meadow", "valley", "river", "forest"];

export function generateRoomId(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const numbers = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  return `${adjective}-${noun}-${numbers}`;
}

export function isValidRoomId(roomId: string): boolean {
  const [adj, noun, numbers] = roomId.split("-");
  return adjectives.includes(adj) && nouns.includes(noun) && /^\d{3}$/.test(numbers);
}
