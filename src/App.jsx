import { useState, useEffect, useRef } from 'react'
import {
  Activity, Zap, MessageSquare, Database, GitBranch,
  CheckCircle2, XCircle, Clock, TrendingUp, Server,
  Radio, Wifi, WifiOff, PlayCircle, Pause, AlertCircle
} from 'lucide-react'
import './App.css'

// WebSocket connection configuration
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://46.225.208.161:3006/events'

// Event type to icon/color mapping
const EVENT_CONFIG = {
  'channel:connected': { icon: Wifi, color: '#10B981' },
  'channel:error': { icon: AlertCircle, color: '#EF4444' },
  'channel:disconnected': { icon: WifiOff, color: '#6B7280' },
  'agent:invoked': { icon: PlayCircle, color: '#3B82F6' },
  'agent:completed': { icon: CheckCircle2, color: '#10B981' },
  'container:spawned': { icon: Server, color: '#8B5CF6' },
  'container:output': { icon: MessageSquare, color: '#06B6D4' },
  'container:closed': { icon: Pause, color: '#6B7280' },
  'ipc:processed': { icon: GitBranch, color: '#F59E0B' },
  'system:shutdown': { icon: XCircle, color: '#DC2626' },
}

function App() {
  const [events, setEvents] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    channels: { connected: 0, errored: 0 },
    agents: { active: 0, completed: 0 },
    containers: { running: 0, total: 0 }
  })
  const [isLive, setIsLive] = useState(true)
  const [wsConnected, setWsConnected] = useState(false)
  const eventsEndRef = useRef(null)
  const wsRef = useRef(null)

  // WebSocket connection
  useEffect(() => {
    if (!isLive) {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      setWsConnected(false)
      return
    }

    // Connect to WebSocket
    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      console.log('WebSocket connected')
      setWsConnected(true)
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)

        // Skip connection/pong messages
        if (message.type === 'connected' || message.type === 'pong') {
          console.log('WebSocket:', message.type)
          return
        }

        // Get event config
        const config = EVENT_CONFIG[message.type]
        if (!config) {
          console.warn('Unknown event type:', message.type)
          return
        }

        // Create event object
        const newEvent = {
          id: Math.random().toString(36).substring(2, 9),
          type: message.type,
          timestamp: message.timestamp,
          icon: config.icon,
          color: config.color,
          ...message.data
        }

        // Add to events list
        setEvents(prev => [newEvent, ...prev].slice(0, 100))

        // Update stats
        setStats(prev => {
          const newStats = { ...prev, total: prev.total + 1 }

          if (message.type.startsWith('channel:')) {
            if (message.type === 'channel:connected') {
              newStats.channels.connected++
            } else if (message.type === 'channel:error') {
              newStats.channels.errored++
            }
          }

          if (message.type.startsWith('agent:')) {
            if (message.type === 'agent:invoked') {
              newStats.agents.active++
            } else if (message.type === 'agent:completed') {
              newStats.agents.active = Math.max(0, newStats.agents.active - 1)
              newStats.agents.completed++
            }
          }

          if (message.type.startsWith('container:')) {
            if (message.type === 'container:spawned') {
              newStats.containers.running++
              newStats.containers.total++
            } else if (message.type === 'container:closed') {
              newStats.containers.running = Math.max(0, newStats.containers.running - 1)
            }
          }

          return newStats
        })
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setWsConnected(false)
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
      setWsConnected(false)
    }

    // Ping interval to keep connection alive
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000)

    return () => {
      clearInterval(pingInterval)
      ws.close()
    }
  }, [isLive])

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <Activity className="logo-icon" />
            <div>
              <h1>NanoClaw Event Monitor</h1>
              <p className="subtitle">Real-time event bus monitoring</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {wsConnected && <span style={{ color: '#10B981', fontSize: '0.875rem', fontFamily: 'Fira Code' }}>● Connected</span>}
            {!wsConnected && isLive && <span style={{ color: '#EF4444', fontSize: '0.875rem', fontFamily: 'Fira Code' }}>● Connecting...</span>}
            <button
              className={`live-button ${isLive ? 'live' : 'paused'}`}
              onClick={() => setIsLive(!isLive)}
            >
              {isLive ? <Radio size={16} /> : <Pause size={16} />}
              {isLive ? 'LIVE' : 'PAUSED'}
            </button>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
            <Zap size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Events</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'}}>
            <Wifi size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.channels.connected}</div>
            <div className="stat-label">Channels Connected</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'}}>
            <Activity size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.agents.active}</div>
            <div className="stat-label">Active Agents</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'}}>
            <Server size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.containers.running}</div>
            <div className="stat-label">Running Containers</div>
          </div>
        </div>
      </div>

      {/* Flow Diagram */}
      <div className="flow-diagram">
        <h2 className="section-title">Event Flow Architecture</h2>
        <div className="flow-content">
          <svg width="100%" height="300" viewBox="0 0 1000 300" className="flow-svg">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor:'#667eea', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:'#764ba2', stopOpacity:1}} />
              </linearGradient>
              <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor:'#10B981', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:'#059669', stopOpacity:1}} />
              </linearGradient>
              <marker id="arrowhead" markerWidth="10" markerHeight="7"
                      refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#3B82F6" />
              </marker>
            </defs>

            {/* Channels */}
            <g>
              <rect x="50" y="50" width="120" height="60" rx="8" fill="url(#grad2)" opacity="0.9"/>
              <text x="110" y="75" textAnchor="middle" fill="white" fontSize="14" fontWeight="600">Channels</text>
              <text x="110" y="95" textAnchor="middle" fill="white" fontSize="11">(Slack, WhatsApp)</text>
            </g>

            {/* EventBus */}
            <g>
              <rect x="250" y="30" width="140" height="100" rx="8" fill="url(#grad1)" opacity="0.9"/>
              <text x="320" y="55" textAnchor="middle" fill="white" fontSize="16" fontWeight="700">EventBus</text>
              <text x="320" y="75" textAnchor="middle" fill="white" fontSize="11">Central Nervous</text>
              <text x="320" y="90" textAnchor="middle" fill="white" fontSize="11">System</text>
              <text x="320" y="110" textAnchor="middle" fill="white" fontSize="10" opacity="0.8">16 event types</text>
            </g>

            {/* Event Listeners */}
            <g>
              <rect x="470" y="50" width="120" height="60" rx="8" fill="#3B82F6" opacity="0.9"/>
              <text x="530" y="75" textAnchor="middle" fill="white" fontSize="14" fontWeight="600">Event</text>
              <text x="530" y="95" textAnchor="middle" fill="white" fontSize="14" fontWeight="600">Listeners</text>
            </g>

            {/* Orchestrator */}
            <g>
              <rect x="670" y="50" width="120" height="60" rx="8" fill="#8B5CF6" opacity="0.9"/>
              <text x="730" y="75" textAnchor="middle" fill="white" fontSize="14" fontWeight="600">Orchestrator</text>
              <text x="730" y="95" textAnchor="middle" fill="white" fontSize="11">(Actions)</text>
            </g>

            {/* Containers */}
            <g>
              <rect x="850" y="170" width="120" height="60" rx="8" fill="#F59E0B" opacity="0.9"/>
              <text x="910" y="195" textAnchor="middle" fill="white" fontSize="14" fontWeight="600">Containers</text>
              <text x="910" y="215" textAnchor="middle" fill="white" fontSize="11">(Agent SDK)</text>
            </g>

            {/* IPC Processor */}
            <g>
              <rect x="670" y="170" width="120" height="60" rx="8" fill="#06B6D4" opacity="0.9"/>
              <text x="730" y="195" textAnchor="middle" fill="white" fontSize="14" fontWeight="600">IPC</text>
              <text x="730" y="215" textAnchor="middle" fill="white" fontSize="11">Processor</text>
            </g>

            {/* Arrows */}
            <line x1="170" y1="80" x2="250" y2="80" stroke="#3B82F6" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <line x1="390" y1="80" x2="470" y2="80" stroke="#3B82F6" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <line x1="590" y1="80" x2="670" y2="80" stroke="#3B82F6" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <line x1="730" y1="110" x2="730" y2="170" stroke="#3B82F6" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <line x1="790" y1="200" x2="850" y2="200" stroke="#3B82F6" strokeWidth="2" markerEnd="url(#arrowhead)"/>

            {/* Feedback arrow */}
            <path d="M 910 170 Q 910 140 730 140 Q 550 140 320 140 L 320 130"
                  stroke="#F59E0B" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" strokeDasharray="5,5"/>

            {/* Labels */}
            <text x="210" y="70" fontSize="10" fill="#64748B">emit</text>
            <text x="430" y="70" fontSize="10" fill="#64748B">listen</text>
            <text x="630" y="70" fontSize="10" fill="#64748B">handle</text>
            <text x="820" y="190" fontSize="10" fill="#64748B">spawn</text>
            <text x="520" y="135" fontSize="10" fill="#F59E0B">feedback loop</text>
          </svg>
        </div>
      </div>

      {/* Event Stream */}
      <div className="event-stream">
        <h2 className="section-title">Live Event Stream</h2>
        <div className="events-container">
          {events.map((event) => {
            const Icon = event.icon
            return (
              <div key={event.id} className="event-card">
                <div className="event-icon" style={{backgroundColor: event.color}}>
                  <Icon size={18} />
                </div>
                <div className="event-details">
                  <div className="event-type">{event.type}</div>
                  <div className="event-meta">
                    <span className="event-time">
                      <Clock size={12} />
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="event-group">{event.groupFolder}</span>
                    {event.channel && <span className="event-channel">{event.channel}</span>}
                    {event.severity && <span className={`event-severity ${event.severity}`}>{event.severity}</span>}
                    {event.status && <span className={`event-status ${event.status}`}>{event.status}</span>}
                    {event.hasOwnProperty('authorized') && (
                      <span className={`event-auth ${event.authorized ? 'authorized' : 'unauthorized'}`}>
                        {event.authorized ? '✓ authorized' : '✗ unauthorized'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={eventsEndRef} />
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>NanoClaw Event Monitor • Real-time Event Bus Visualization</p>
        <p className="footer-tech">Built with React + Vite • Dark Mode Design System</p>
      </footer>
    </div>
  )
}

export default App
