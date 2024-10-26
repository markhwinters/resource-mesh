"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, Share2, Package, Battery, Signal, AlertCircle, CheckCircle2, Radio, Bell } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ResourceMeshApp = () => {
  // Enhanced state management with localStorage persistence
  const [networkStatus, setNetworkStatus] = useState(() => {
    return localStorage.getItem('networkStatus') || 'mesh';
  });
  const [activeTab, setActiveTab] = useState('nearby');
  const [broadcasts, setBroadcasts] = useState(() => {
    return JSON.parse(localStorage.getItem('broadcasts')) || [];
  });
  const [batteryLevel, setBatteryLevel] = useState(75);

  // Persist state changes to localStorage
  useEffect(() => {
    localStorage.setItem('networkStatus', networkStatus);
    localStorage.setItem('broadcasts', JSON.stringify(broadcasts));
  }, [networkStatus, broadcasts]);

  const nearbyPeers = [
    {
      id: 1,
      name: "Emergency Shelter A",
      distance: "0.3km",
      signalStrength: "strong",
      batteryLevel: 85,
      isRelay: true,
      resources: ["Generator", "Water"]
    },
    {
      id: 2,
      name: "Medical Station B",
      distance: "0.8km",
      signalStrength: "medium",
      batteryLevel: 45,
      isRelay: false,
      resources: ["Medical Supplies"]
    },
    {
      id: 3,
      name: "Supply Hub C",
      distance: "1.2km",
      signalStrength: "weak",
      batteryLevel: 90,
      isRelay: true,
      resources: ["Food", "Water"]
    }
  ];

  const resources = [
    {
      id: 1,
      type: "Urgent Need",
      item: "Portable Generator",
      quantity: "1 unit",
      location: "Emergency Shelter A",
      status: "Unmatched",
      priority: "high",
      matchScore: 0.9
    },
    {
      id: 2,
      type: "Available",
      item: "Drinking Water",
      quantity: "50 gallons",
      location: "Supply Hub C",
      status: "Available",
      priority: "medium",
      matchScore: 0.7
    },
    {
      id: 3,
      type: "In Transit",
      item: "First Aid Kits",
      quantity: "10 kits",
      location: "Medical Station B",
      status: "Moving",
      priority: "high",
      matchScore: 0.85
    }
  ];

  // Emergency broadcast functionality
  const createBroadcast = () => {
    const newBroadcast = {
      id: Date.now(),
      message: "Emergency Medical Supplies Needed at Shelter A",
      priority: "high",
      timestamp: new Date().toISOString(),
      acknowledged: false
    };
    setBroadcasts([newBroadcast, ...broadcasts]);
  };

  const getSignalIcon = (strength) => {
    switch(strength) {
      case 'strong':
        return <Signal className="w-4 h-4 text-green-500" />;
      case 'medium':
        return <Signal className="w-4 h-4 text-yellow-500" />;
      case 'weak':
        return <Signal className="w-4 h-4 text-red-500" />;
      default:
        return <Signal className="w-4 h-4" />;
    }
  };

  // Resource matching algorithm demo
  const getMatchScore = (resource) => {
    if (!resource.matchScore) return null;
    const score = resource.matchScore * 100;
    return (
      <Badge variant={score > 80 ? 'success' : score > 60 ? 'secondary' : 'outline'}>
        {score.toFixed(0)}% Match
      </Badge>
    );
  };

  return (
    <div className="w-full max-w-4xl p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 className="w-6 h-6" />
              Resource Mesh Network
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={networkStatus === 'mesh' ? 'success' : 'destructive'}>
                {networkStatus === 'mesh' ? 
                  <div className="flex items-center gap-1">
                    <Wifi className="w-4 h-4" /> Mesh Active
                  </div> : 
                  <div className="flex items-center gap-1">
                    <WifiOff className="w-4 h-4" /> Internet Down
                  </div>
                }
              </Badge>
              <Badge variant="outline">
                <div className="flex items-center gap-1">
                  <Battery className="w-4 h-4" /> {batteryLevel}%
                </div>
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Button 
              variant={activeTab === 'nearby' ? 'default' : 'outline'}
              onClick={() => setActiveTab('nearby')}
            >
              Nearby Nodes
            </Button>
            <Button 
              variant={activeTab === 'resources' ? 'default' : 'outline'}
              onClick={() => setActiveTab('resources')}
            >
              Resources
            </Button>
            <Button 
              variant={activeTab === 'broadcasts' ? 'default' : 'outline'}
              onClick={() => setActiveTab('broadcasts')}
            >
              <Radio className="w-4 h-4 mr-2" />
              Broadcasts
            </Button>
          </div>

          {/* Emergency Broadcast Alert */}
          {broadcasts.length > 0 && activeTab !== 'broadcasts' && (
            <Alert className="mb-4">
              <Bell className="w-4 h-4" />
              <AlertDescription>
                {broadcasts.length} active emergency broadcast{broadcasts.length !== 1 ? 's' : ''}
              </AlertDescription>
            </Alert>
          )}

          {activeTab === 'nearby' && (
            <div className="space-y-4">
              {nearbyPeers.map(peer => (
                <Card key={peer.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      {getSignalIcon(peer.signalStrength)}
                      <div>
                        <h3 className="font-semibold text-lg">{peer.name}</h3>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{peer.distance}</Badge>
                          <Badge variant="secondary">
                            <Battery className="w-4 h-4 mr-1" />
                            {peer.batteryLevel}%
                          </Badge>
                          {peer.isRelay && (
                            <Badge variant="success">Relay Node</Badge>
                          )}
                        </div>
                        <div className="flex gap-2 mt-2">
                          {peer.resources.map((resource, idx) => (
                            <Badge key={idx} variant="outline">{resource}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button size="sm">Connect</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-4">
              {resources.map(resource => (
                <Card key={resource.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Package className="w-6 h-6" />
                      <div>
                        <h3 className="font-semibold text-lg">{resource.item}</h3>
                        <p className="text-gray-600">{resource.quantity} • {resource.location}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={
                            resource.type === 'Urgent Need' ? 'destructive' : 
                            resource.type === 'Available' ? 'success' : 
                            'secondary'
                          }>
                            {resource.type}
                          </Badge>
                          <Badge variant={resource.priority === 'high' ? 'destructive' : 'default'}>
                            {resource.priority === 'high' ? 
                              <AlertCircle className="w-4 h-4 mr-1" /> :
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                            }
                            {resource.priority} priority
                          </Badge>
                          {getMatchScore(resource)}
                        </div>
                      </div>
                    </div>
                    <Button size="sm">
                      {resource.type === 'Urgent Need' ? 'Offer Help' : 
                       resource.type === 'Available' ? 'Request' : 
                       'Track'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'broadcasts' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Emergency Broadcasts</h3>
                <Button onClick={createBroadcast}>
                  <Radio className="w-4 h-4 mr-2" />
                  New Broadcast
                </Button>
              </div>
              {broadcasts.map(broadcast => (
                <Card key={broadcast.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <h4 className="font-semibold">{broadcast.message}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {new Date(broadcast.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={broadcast.acknowledged ? 'success' : 'destructive'}>
                      {broadcast.acknowledged ? 'Acknowledged' : 'Unacknowledged'}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <Card className="mt-4 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-600" />
                <p className="text-blue-600 text-sm">
                  Mesh network active with 3 direct connections and 12 nodes in range. 
                  Estimated coverage: 2.5km radius. {networkStatus === 'mesh' ? 
                    'All data synced locally.' : 
                    'Operating in offline mode - data stored locally.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourceMeshApp;
