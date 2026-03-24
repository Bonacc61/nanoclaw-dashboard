# NanoClaw Event Monitor

Real-time event monitoring dashboard for NanoClaw - Track channels, agents, containers, and IPC events with live SVG flow visualization.

![Dashboard Preview](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-4.4-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

## Features

- **Real-time Event Streaming** - Live event feed with live/pause toggle
- **Statistics Dashboard** - Track total events, channels connected, active agents, running containers
- **SVG Flow Diagram** - Visual representation of event flow architecture
- **16 Event Types** - Monitor channel lifecycle, agent invocations, container spawns, IPC messages, and more
- **Dark Mode OLED Design** - Beautiful, high-contrast interface optimized for monitoring
- **Color-coded Events** - Instant visual feedback with event-specific colors
- **Event Metadata** - Timestamps, group folders, channels, severity levels, status indicators

## Event Types Monitored

### Channel Events
- `channel:connected` - Channel successfully connected
- `channel:error` - Channel error (warning/critical)
- `channel:disconnected` - Channel disconnected

### Agent Events
- `agent:invoked` - Agent invocation started
- `agent:completed` - Agent task completed (success/error)

### Container Events
- `container:spawned` - New container spawned
- `container:output` - Container output received
- `container:closed` - Container shutdown

### IPC Events
- `ipc:processed` - IPC message processed (authorized/unauthorized)

### System Events
- `system:shutdown` - System shutdown initiated

## Tech Stack

- **React 18.2** - UI framework
- **Vite 4.4** - Build tool and dev server
- **Lucide React** - Icon library
- **Fira Code + Fira Sans** - Typography system
- **Dark Mode OLED** - Design system

## Development

```bash
# Install dependencies
npm install

# Start dev server (port 3005)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

```
Channels (Slack, WhatsApp)
    ↓ emit
EventBus (Central Nervous System)
    ↓ listen
Event Listeners
    ↓ handle
Orchestrator (Actions)
    ↓ spawn
Containers (Agent SDK)
    ↓ IPC
IPC Processor
    ↓ feedback loop
EventBus
```

## Design System

- **Colors**: Dark OLED background with blue/purple/green accents
- **Typography**: Fira Code (monospace) for code/data, Fira Sans for UI text
- **Spacing**: Consistent 8px grid system
- **Shadows**: Layered elevation with OLED-optimized shadows
- **Animations**: Subtle pulse effects for live indicators

## Event Card Structure

Each event card displays:
- **Icon** - Color-coded visual indicator
- **Event Type** - Action identifier (e.g., `channel:connected`)
- **Timestamp** - When the event occurred
- **Group Folder** - Which group triggered the event
- **Channel** - Source channel (if applicable)
- **Severity** - Error severity level (if applicable)
- **Status** - Success/error indicator (if applicable)
- **Authorization** - IPC authorization status (if applicable)

## Deployment

### Cloudflare Pages

1. Connect this repository to Cloudflare Pages
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy!

### Environment Variables

No environment variables required - this is a demo dashboard with mock data.

For production integration with real NanoClaw event bus, you'll need to:
1. Connect to WebSocket or SSE endpoint
2. Replace mock event generator with real event stream
3. Add authentication if needed

## License

MIT

## Related Projects

- [NanoClaw](https://github.com/anthropics/nanoclaw) - Personal Claude assistant framework
- [Model Routing System](../docs/MODEL-ROUTING.md) - Cost optimization for Claude API
- [Event Bus Architecture](../docs/EVENT-BUS.md) - Type-safe event system

---

**Status**: ✅ Production-ready mock dashboard

**Use Case**: Monitor NanoClaw deployments across channels, visualize event flow, track system health

**Next Steps**: Connect to real NanoClaw event stream via WebSocket/SSE
