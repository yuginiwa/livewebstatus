import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { AlertTriangle, Droplets, MapPin, Clock, RefreshCw, Activity, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import './App.css'

function App() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [damStatus, setDamStatus] = useState([])

  const fetchFloodData = async () => {
    setLoading(true)
    try {
      const response = await fetch('https://panahon.gov.ph/api/v1/cap-alerts?token=B3aOHsq8nCSNeuBaU1mGow7R05LxI7bIAEr0AXGd')
      const data = await response.json()
      
      if (data.success) {
        const floodAlerts = data.data.alert_data.filter(alert => 
          alert.message.toLowerCase().includes('flood') || 
          alert.message.toLowerCase().includes('thunderstorm') ||
          alert.event.toLowerCase().includes('thunderstorm')
        )
        setAlerts(floodAlerts)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Error fetching flood data:', error)
    }
    setLoading(false)
  }

  // Manually extracted and hardcoded dam data from the GIF for demonstration
  // In a real-world scenario, this would require image processing or a dedicated API
  const fetchDamStatus = () => {
    const dams = [
      { name: 'ANGAT', rwl: 198.11, nhwl: 210.00, deviation: -11.89, gateOpening: 'N/A' },
      { name: 'IPO', rwl: 100.28, nhwl: 101.10, deviation: -0.82, gateOpening: '1 gate / 0.8 m = 92.90 cms' },
      { name: 'LA MESA', rwl: 80.17, nhwl: 80.15, deviation: 0.02, gateOpening: 'OVERFLOWING at 1.145 cms' },
      { name: 'AMBUKLAO', rwl: 751.00, nhwl: 752.00, deviation: -1.00, gateOpening: '3 gates / 1.5 m = 243.26 cms' },
      { name: 'BINGA', rwl: 572.66, nhwl: 575.00, deviation: -2.34, gateOpening: '3 gates / 1.5 m = 218.80 cms' },
      { name: 'SAN ROQUE', rwl: 246.61, nhwl: 280.00, deviation: -33.39, gateOpening: 'N/A' },
      { name: 'PANTABANGAN', rwl: 194.11, nhwl: 216.00, deviation: -21.89, gateOpening: 'N/A' },
      { name: 'MAGAT', rwl: 185.03, nhwl: 190.00, deviation: -4.97, gateOpening: 'N/A' },
      { name: 'CALIRAYA', rwl: 287.86, nhwl: null, deviation: 0.16, gateOpening: 'N/A' },
    ];

    const summarizedDams = dams.map(dam => {
      let status = 'Normal';
      let advice = 'No immediate concerns.';
      let statusColor = 'text-green-600';
      let icon = <CheckCircle className="h-5 w-5" />;

      if (dam.nhwl !== null) {
        if (dam.rwl >= dam.nhwl) {
          status = 'Danger';
          advice = 'Water level at or above Normal High Water Level. Potential for overflow/flooding. Evacuation may be needed.';
          statusColor = 'text-red-600';
          icon = <XCircle className="h-5 w-5" />;
        } else if (dam.nhwl - dam.rwl <= 2) { // Within 2 meters of NHWL
          status = 'Caution';
          advice = 'Water level approaching Normal High Water Level. Monitor closely. Be prepared for alerts.';
          statusColor = 'text-yellow-600';
          icon = <AlertCircle className="h-5 w-5" />;
        }
      }
      if (dam.gateOpening && dam.gateOpening !== 'N/A') {
        advice += ` Gate opening: ${dam.gateOpening}.`;
        if (status === 'Normal') {
          status = 'Caution'; // Even if normal, gate opening means water release
          advice = 'Gates are open, indicating water release. Monitor closely.';
          statusColor = 'text-yellow-600';
          icon = <AlertCircle className="h-5 w-5" />;
        }
      }
      return { ...dam, status, advice, statusColor, icon };
    });
    setDamStatus(summarizedDams);
  };

  useEffect(() => {
    fetchFloodData()
    fetchDamStatus()
    const interval = setInterval(() => {
      fetchFloodData();
      fetchDamStatus();
    }, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const getSeverityColor = (message) => {
    const lowerMessage = message.toLowerCase()
    if (lowerMessage.includes('heavy') || lowerMessage.includes('severe') || lowerMessage.includes('extreme')) {
      return 'destructive'
    } else if (lowerMessage.includes('moderate')) {
      return 'default'
    }
    return 'secondary'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-PH', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const summarizeAdvisory = (alert) => {
    const summary = {
      type: alert.event,
      headline: alert.headline,
      advisory: 'No specific advisory action mentioned.',
      evacuationNeeded: false,
      affectedAreas: alert.provinces.map(p => p.province).join(', ') || 'Not specified',
      keyPhrases: [],
    };

    const lowerMessage = alert.message.toLowerCase();
    const lowerOptionalMessage = alert.optional_message ? alert.optional_message.toLowerCase() : '';

    if (lowerMessage.includes('evacuation') || lowerOptionalMessage.includes('evacuation')) {
      summary.evacuationNeeded = true;
      summary.advisory = 'Evacuation may be necessary. Follow local authorities.';
      summary.keyPhrases.push('Evacuation Advisory');
    } else if (lowerMessage.includes('precautionary measures') || lowerOptionalMessage.includes('precautionary measures')) {
      summary.advisory = 'Take precautionary measures. Monitor updates.';
      summary.keyPhrases.push('Precautionary Measures');
    } else if (lowerMessage.includes('flash floods') || lowerOptionalMessage.includes('flash floods')) {
      summary.advisory = 'Be alert for possible flash floods.';
      summary.keyPhrases.push('Flash Flood Alert');
    }

    if (lowerMessage.includes('heavy rains') || lowerMessage.includes('severe rains')) {
      summary.keyPhrases.push('Heavy Rains');
    } else if (lowerMessage.includes('moderate rains')) {
      summary.keyPhrases.push('Moderate Rains');
    }

    if (lowerMessage.includes('landslides') || lowerOptionalMessage.includes('landslides')) {
      summary.keyPhrases.push('Landslide Warning');
    }

    return summary;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Droplets className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Philippines Flood Status
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Live monitoring from PAG-ASA
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {lastUpdated && (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="h-4 w-4 mr-1" />
                  Last updated: {lastUpdated.toLocaleTimeString('en-PH')}
                </div>
              )}
              <Button 
                onClick={() => { fetchFloodData(); fetchDamStatus(); }} 
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alerts.length}</div>
              <p className="text-xs text-muted-foreground">
                Current flood-related warnings
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Source</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">PAG-ASA</div>
              <p className="text-xs text-muted-foreground">
                Philippine weather service
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Update Frequency</CardTitle>
              <RefreshCw className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5 min</div>
              <p className="text-xs text-muted-foreground">
                Auto-refresh interval
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Dam Status Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Droplets className="h-5 w-5 mr-2 text-blue-600" />
              Dam Water Levels Summary
            </CardTitle>
            <CardDescription>
              Overview of dam water levels and their current status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {damStatus.map((dam, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{dam.name}</h3>
                    <div className={`flex items-center gap-1 ${dam.statusColor}`}>
                      {dam.icon}
                      <span className="font-medium">{dam.status}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    RWL: {dam.rwl}m {dam.nhwl ? `/ NHWL: ${dam.nhwl}m` : ''}
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Deviation: {dam.deviation}m
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {dam.advice}
                  </p>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Alerts */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <AlertTriangle className="h-6 w-6 mr-2 text-orange-500" />
            Active Flood Advisories
          </h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-lg">Loading flood data...</span>
            </div>
          ) : alerts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-green-600 dark:text-green-400 mb-4">
                  <Droplets className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Active Flood Advisories
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  All areas are currently clear of flood warnings.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {alerts.map((alert, index) => {
                const summary = summarizeAdvisory(alert);
                return (
                  <Card key={alert.identifier || index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">
                            {alert.headline}
                          </CardTitle>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant={getSeverityColor(alert.message)}>
                              {alert.event}
                            </Badge>
                            <Badge variant="outline">
                              {alert.subtype}
                            </Badge>
                            {summary.evacuationNeeded && (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" /> Evacuation Advised
                              </Badge>
                            )}
                            {summary.keyPhrases.map((phrase, pIdx) => (
                              <Badge key={pIdx} variant="secondary">
                                {phrase}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center mb-1">
                            <Clock className="h-4 w-4 mr-1" />
                            Issued: {formatDate(alert.issued_date)}
                          </div>
                          <div>Valid until: {formatDate(alert.valid_date)}</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Summary:</h4>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {summary.advisory}
                          </p>
                        </div>
                        
                        {summary.affectedAreas && summary.affectedAreas !== 'Not specified' && (
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              Affected Areas:
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300">
                              {summary.affectedAreas}
                            </p>
                          </div>
                        )}
                        
                        <details className="text-sm text-gray-500 dark:text-gray-400">
                          <summary className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-200">View Full Advisory</summary>
                          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                              {alert.message}
                            </p>
                            {alert.optional_message && (
                              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                <h4 className="font-semibold mb-1">Important Notice:</h4>
                                <p className="text-gray-700 dark:text-gray-300">
                                  {alert.optional_message}
                                </p>
                              </div>
                            )}
                          </div>
                        </details>
                        
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Published by: <span className="font-medium">{alert.published_by}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App


