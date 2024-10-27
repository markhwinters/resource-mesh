/* eslint-disable */

"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { 
  Wifi, Package, MapPin, Signal, AlertCircle, 
  Check, RefreshCcw, Radio, Clock, User
} from 'lucide-react';

// Enhanced mock mesh network with better message handling
class MockMeshNetwork {
  constructor() {
    this.listeners = new Map();
    this.connected = false;
    this.nodes = new Map();
    this.messageId = 0;
    this.mockNodeData();
  }

  mockNodeData() {
    this.nodes.set(1, { 
      num: 1, 
      name: 'Alpha',
      lastHeard: Date.now(), 
      snr: 10, 
      rssi: -50,
      position: { lat: 37.7749, lon: -122.4194 }
    });
    this.nodes.set(2, { 
      num: 2, 
      name: 'Beta',
      lastHeard: Date.now(), 
      snr: 8, 
      rssi: -60,
      position: { lat: 37.7748, lon: -122.4193 }
    });
  }

  generateMockMessage(type = 'text') {
    const types = ['text', 'position', 'data', 'emergency'];
    const mockMessages = {
      text: 'Test broadcast message',
      position: 'Location update',
      data: 'Sensor reading: 23.5C',
      emergency: 'HELP NEEDED'
    };
    
    const messageType = type || types[Math.floor(Math.random() * types.length)];
    const fromNode = Array.from(this.nodes.values())[Math.floor(Math.random() * this.nodes.size)];
    
    return {
      id: ++this.messageId,
      type: messageType,
      from: fromNode.name,
      nodeId: fromNode.num,
      text: mockMessages[messageType],
      timestamp: Date.now(),
      received: Date.now(),
      rssi: fromNode.rssi,
      snr: fromNode.snr,
      hopCount: Math.floor(Math.random() * 3),
      status: 'received',
      priority: messageType === 'emergency' ? 'high' : 'normal'
    };
  }

  on(event, callback) {
    this.listeners.set(event, callback);
  }

  connect() {
    setTimeout(() => {
      this.connected = true;
      this.listeners.get('connected')?.();
      
      // Simulate periodic messages and updates
      setInterval(() => {
        if (Math.random() > 0.7) {
          const message = this.generateMockMessage();
          this.listeners.get('messageReceived')?.(message);
        }
        this.nodes.forEach((node) => {
          node.lastHeard = Date.now();
          this.listeners.get('nodeUpdated')?.(node);
        });
      }, 5000);
    }, 1000);
  }

  disconnect() {
    this.connected = false;
    this.listeners.get('disconnected')?.();
  }

  async sendText(message) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const meshMessage = {
          id: ++this.messageId,
          type: 'text',
          from: 'Local',
          nodeId: 0,
          text: message.text,
          timestamp: Date.now(),
          received: Date.now(),
          rssi: -40,
          snr: 12,
          hopCount: 0,
          status: 'sent',
          priority: 'normal'
        };
        
        this.listeners.get('messageReceived')?.(meshMessage);
        resolve({ success: true, messageId: this.messageId });
      }, 500);
    });
  }

  isConnected() {
    return this.connected;
  }
}

const MessageItem = ({ message }) => {
  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'emergency':
        return <AlertCircle className="text-red-500" size={16} />;
      case 'position':
        return <MapPin className="text-green-500" size={16} />;
      case 'data':
        return <RefreshCcw className="text-blue-500" size={16} />;
      default:
        return <Radio className="text-gray-500" size={16} />;
    }
  };

  const getStatusIndicator = (status) => {
    switch (status) {
      case 'sent':
        return <Check className="text-green-500" size={14} />;
      case 'received':
        return <Clock className="text-blue-500" size={14} />;
      default:
        return null;
    }
  };

  return (
    <div className={`p-3 rounded-lg mb-2 ${
      message.priority === 'high' ? 'bg-red-50' : 
      message.type === 'position' ? 'bg-green-50' : 
      'bg-gray-50'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {getMessageTypeIcon(message.type)}
          <span className="font-medium">{message.from}</span>
          <span className="text-xs text-gray-500">
            Node {message.nodeId}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {getStatusIndicator(message.status)}
          <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>
      
      <div className="mt-1 ml-6">
        {message.text}
      </div>
      
      <div className="mt-1 ml-6 flex items-center gap-4 text-xs text-gray-500">
        <span>RSSI: {message.rssi}dBm</span>
        <span>SNR: {message.snr}dB</span>
        <span>Hops: {message.hopCount}</span>
      </div>
    </div>
  );
};

const MessagesTab = ({ client, connectionStatus, messages, setMessages }) => {
  const [newMessage, setNewMessage] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredMessages = messages.filter(msg => {
    if (filter === 'all') return true;
    return msg.type === filter;
  });

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !client || !connectionStatus.isConnected) return;

    try {
      await client.sendText({
        text: newMessage,
        broadcast: true,
        wantAck: true,
      });
      
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Mesh Network Messages</CardTitle>
          <div className="flex gap-2">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-1 text-sm border rounded"
            >
              <option value="all">All Messages</option>
              <option value="text">Text</option>
              <option value="position">Position</option>
              <option value="data">Data</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-96 overflow-y-auto border rounded p-2 bg-white">
            {filteredMessages.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                No messages yet
              </div>
            ) : (
              filteredMessages.map(msg => (
                <MessageItem key={msg.id} message={msg} />
              ))
            )}
          </div>
          
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 p-2 border rounded"
              placeholder="Type your message..."
              disabled={!connectionStatus.isConnected}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
              disabled={!connectionStatus.isConnected || !newMessage.trim()}
            >
              Broadcast
            </button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

// Main App Component
const MeshNetwork = () => {
  const [client, setClient] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: false,
    error: null,
  });
  const [nodes, setNodes] = useState(new Map());
  const [messages, setMessages] = useState([]);
  const [resources, setResources] = useState([
    { id: 1, name: 'Water', status: 'available', priority: 'high', quantity: 50, location: 'Node-1' },
    { id: 2, name: 'Medical Supplies', status: 'needed', priority: 'critical', quantity: 10, location: 'Node-2' },
  ]);

  const initializeMeshNetwork = useCallback(async () => {
    try {
      const mockClient = new MockMeshNetwork();
      
      mockClient.on('connected', () => {
        setConnectionStatus({ isConnected: true, error: null });
      });

      mockClient.on('disconnected', () => {
        setConnectionStatus({ isConnected: false, error: 'Disconnected from network' });
      });

      mockClient.on('nodeUpdated', (node) => {
        setNodes(prev => new Map(prev).set(node.num, node));
      });

      mockClient.on('messageReceived', (message) => {
        setMessages(prev => [...prev, message]);
      });

      mockClient.connect();
      setClient(mockClient);
    } catch (error) {
      console.error('Failed to initialize mesh network:', error);
      setConnectionStatus({ isConnected: false, error: error.message });
    }
  }, []);

  useEffect(() => {
    initializeMeshNetwork();
    return () => {
      if (client) {
        client.disconnect();
      }
    };
  }, [initializeMeshNetwork]);

  // Network Status Tab Component
  const NetworkTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className={connectionStatus.isConnected ? 'text-green-500' : 'text-red-500'} />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Signal />
              <span>{nodes.size} Active Nodes</span>
            </div>
            {connectionStatus.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{connectionStatus.error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Network Nodes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from(nodes.values()).map((node) => (
              <div key={node.num} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  <MapPin className="text-blue-500" size={16} />
                  {node.name} (Node {node.num})
                </div>
                <div className="text-sm">
                  {node.lastHeard ? new Date(node.lastHeard).toLocaleTimeString() : 'Never'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Resources Tab Component
  const ResourcesTab = () => (
    <Card>
      <CardHeader>
        <CardTitle>Available Resources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {resources.map(resource => (
            <div key={resource.id} className="flex items-center justify-between p-2 border rounded">
              <div>
                <Package className="inline mr-2" size={16} />
                {resource.name}
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-sm ${
                  resource.status === 'available' ? 'bg-green-100 text-green-800' :
                  resource.status === 'needed' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {resource.status}
                </span>
                <span>{resource.quantity}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Tabs defaultValue="messages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="network">
          <NetworkTab />
        </TabsContent>

        <TabsContent value="resources">
          <ResourcesTab />
        </TabsContent>

        <TabsContent value="messages">
          <MessagesTab 
            client={client}
            connectionStatus={connectionStatus}
            messages={messages}
            setMessages={setMessages}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MeshNetwork;