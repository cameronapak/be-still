import type * as Party from "partykit/server";

interface User {
  connectionId: string;
  isHost: boolean;
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
  isHost?: boolean;
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
    const isHost = this.users.size === 0;
    
    this.users.set(conn.id, {
      connectionId: conn.id,
      isHost,
      presence: {
        emoji: "😌",
        name: "",
        countryFlag: "🌎",
        joinedAt: new Date().getTime(),
      },
    });

    this.sendStateToClient(conn);
  }

  onClose(conn: Party.Connection) {
    const user = this.users.get(conn.id);
    
    if (user?.isHost) {
      const closeMessage = {
        type: "room_closed",
        message: "Host has left the room"
      };
      
      for (const connection of this.room.getConnections()) {
        connection.send(JSON.stringify(closeMessage));
      }
    }
    
    this.users.delete(conn.id);
    this.broadcastState();
  }

  onMessage(message: string, sender: Party.Connection) {
    try {
      const data = JSON.parse(message) as PresenceMessage;

      if (data.type === "presence") {
        const currentUser = this.users.get(sender.id);
        if (currentUser) {
          currentUser.presence = {
            emoji: data.presence.emoji,
            name: data.presence.name,
            countryFlag: data.presence.countryFlag,
            joinedAt: data.presence.joinedAt || currentUser.presence.joinedAt,
          };
          this.users.set(sender.id, currentUser);

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

    for (const conn of this.room.getConnections()) {
      conn.send(JSON.stringify(stateMessage));
    }
  }
}

Server satisfies Party.Worker;
