import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { SourceCitation } from '@/components/business/source-citation';

export default function Alerts() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Alerts & Insights</h1>
          <p className="text-slate-500 mt-1">AI-detected anomalies, deadlines, and insights.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Mark all read</Button>
        </div>
      </div>
      
      <div className="space-y-4">
        <Card className="border-l-4 border-l-error shadow-sm overflow-hidden group">
          <CardContent className="p-0">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-error/10 p-2 rounded-full">
                    <AlertCircle className="w-5 h-5 text-error" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900">Warranty Expiring Soon</h3>
                    <div className="flex items-center text-xs text-slate-500 mt-1">
                      <Clock className="w-3 h-3 mr-1" /> Detected 2 hours ago
                    </div>
                  </div>
                </div>
                <Badge status="LOW">High Priority</Badge>
              </div>
              
              <div className="ml-12 pl-2">
                <p className="text-slate-700 mb-4">
                  The warranty for <strong>Samsung TV Batch #4992 (10 units)</strong> expires in 5 days on Oct 12, 2024. 
                  Consider offering extended warranty to these customers.
                </p>
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-sm text-slate-500">Source:</span>
                  <SourceCitation documentName="Invoice #4992" />
                </div>
                <div className="flex gap-3">
                  <Button size="sm">Acknowledge</Button>
                  <Button variant="outline" size="sm">View Impacted Customers</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning shadow-sm overflow-hidden group">
          <CardContent className="p-0">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-warning/10 p-2 rounded-full">
                    <AlertCircle className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900">Price Anomaly Detected</h3>
                    <div className="flex items-center text-xs text-slate-500 mt-1">
                      <Clock className="w-3 h-3 mr-1" /> Detected 1 day ago
                    </div>
                  </div>
                </div>
                <Badge status="MEDIUM">Medium Priority</Badge>
              </div>
              
              <div className="ml-12 pl-2">
                <p className="text-slate-700 mb-4">
                  You recently paid <strong>₹42,000</strong> for LG 1.5 Ton AC from <span className="font-medium">Gupta Electronics</span>, which is <strong>12% higher</strong> than your historical average of ₹37,500.
                </p>
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-sm text-slate-500">Sources:</span>
                  <SourceCitation documentName="Recent Invoice" />
                  <span className="text-slate-300">•</span>
                  <SourceCitation documentName="Historical Price Data" />
                </div>
                <div className="flex gap-3">
                  <Button size="sm">Acknowledge</Button>
                  <Button variant="outline" size="sm">Compare Suppliers</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center p-8 text-slate-400 mt-8">
          <CheckCircle2 className="w-5 h-5 mr-2" />
          <span className="text-sm">You're all caught up on alerts.</span>
        </div>
      </div>
    </div>
  );
}
