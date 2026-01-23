import app from "./app.js";
import { config } from "./config/index.js";

// =============================================================================
// Start Server (for local development)
// =============================================================================

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   DEBS Insurance API Server                               ║
║                                                           ║
║   Environment: ${config.nodeEnv.padEnd(40)}║
║   Port: ${PORT.toString().padEnd(47)}║
║   URL: http://localhost:${PORT.toString().padEnd(32)}║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
