const { createClient } = require("redis");

const client = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    keepAlive: 10000,
    reconnectStrategy: (retries) => Math.min(retries * 500, 5000),
  },
});

client.on("error", (err) => console.error("Redis Error:", err));
client.on("connect", () => console.log("Redis connected"));

(async () => {
  try {
    if (!client.isOpen) {
      await client.connect();
    }
  } catch (err) {
    console.error("Redis connection failed:", err);
  }
})();

module.exports = client;
