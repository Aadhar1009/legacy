import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, MessageSquare, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Customers</CardTitle>
          </CardHeader>
          <CardContent><div className="text-3xl font-bold text-slate-900">1,248</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Suppliers</CardTitle>
          </CardHeader>
          <CardContent><div className="text-3xl font-bold text-slate-900">42</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Documents Indexed</CardTitle>
          </CardHeader>
          <CardContent><div className="text-3xl font-bold text-slate-900">3,891</div></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Important Alerts</h2>
          <Card className="border-l-4 border-l-error">
            <CardContent className="p-4 flex justify-between items-center">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-error mt-0.5" />
                <div>
                  <h4 className="font-medium text-slate-900">Warranty Expiring Soon</h4>
                  <p className="text-sm text-slate-500 mt-1">Samsung TV Batch #4992 warranty expires in 5 days</p>
                </div>
              </div>
              <Button size="sm" variant="outline">View</Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/documents" className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border border-slate-200 hover:border-primary hover:text-primary transition-colors text-center group shadow-sm">
              <div className="bg-primary/10 p-3 rounded-full mb-3 group-hover:bg-primary/20 transition-colors">
                <UploadCloud className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-slate-900">Upload Document</span>
            </Link>
            <Link href="/memory" className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border border-slate-200 hover:border-primary hover:text-primary transition-colors text-center group shadow-sm">
              <div className="bg-primary/10 p-3 rounded-full mb-3 group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-slate-900">Ask Memory</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
