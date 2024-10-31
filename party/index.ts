import type * as Party from "partykit/server";

interface User {
  connectionId: string;
  presence: {
    emoji: string;
    name: string;
    countryFlag: string;
    joinedAt: number;
  };
}

interface StateMessage {
  type: "state_update";
  users: User[];
}

interface PresenceMessage {
  type: "presence";
  presence: {
    emoji: string;
    name: string;
    countryFlag: string;
    joinedAt: number;
  };
}

export default class Server implements Party.Server {
  private users: Map<string, User>;

  constructor(readonly room: Party.Room) {
    this.users = new Map();
  }

  onConnect(conn: Party.Connection) {
    // Add user with default state
    this.users.set(conn.id, {
      connectionId: conn.id,
      presence: {
        emoji: "😌",
        name: "",
        countryFlag: "🌎",
        joinedAt: new Date().getTime(),
      },
    });

    // Send current state to the new connection
    this.sendStateToClient(conn);
  }

  onClose(conn: Party.Connection) {
    // Remove user when they disconnect
    this.users.delete(conn.id);
    // Broadcast updated state to all remaining clients
    this.broadcastState();
  }

  onMessage(message: string, sender: Party.Connection) {
    try {
      const data = JSON.parse(message) as PresenceMessage;

      if (data.type === "presence") {
        const currentUser = this.users.get(sender.id);
        if (currentUser) {
          // Update user's presence
          currentUser.presence = {
            emoji: data.presence.emoji,
            name: data.presence.name,
            countryFlag: data.presence.countryFlag,
            joinedAt: data.presence.joinedAt || currentUser.presence.joinedAt,
          };
          this.users.set(sender.id, currentUser);

          // Broadcast updated state to all clients
          this.broadcastState();
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  }

  private sendStateToClient(conn: Party.Connection) {
    const stateMessage: StateMessage = {
      type: "state_update",
      users: Array.from(this.users.values())
    };
    conn.send(JSON.stringify(stateMessage));
  }

  private broadcastState() {
    const stateMessage: StateMessage = {
      type: "state_update",
      users: Array.from(this.users.values())
    };

    // Broadcast state to all connections
    for (const conn of this.room.getConnections()) {
      conn.send(JSON.stringify(stateMessage));
    }
  }
}

Server satisfies Party.Worker;
