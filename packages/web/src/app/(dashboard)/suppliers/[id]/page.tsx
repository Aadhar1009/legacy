import { Timeline } from '@/components/business/timeline';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MapPin, ExternalLink, Receipt, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function SupplierDetail({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-2">
        <Link href="/suppliers" className="text-sm text-slate-500 hover:text-primary transition-colors">← Back to Suppliers</Link>
      </div>

      <div className="bg-white border rounded-xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              Sharma Electronics
              <Badge status="HIGH">Active</Badge>
            </h1>
            <p className="text-slate-500 mt-2 text-sm max-w-2xl">
              Primary distributor for Samsung and LG home appliances in the NCR region. 
              Consistent supplier since 2021.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 text-slate-700">
            <div className="bg-slate-100 p-2 rounded-full"><Phone className="w-4 h-4" /></div>
            <div>
              <div className="text-xs text-slate-500">Rajesh Sharma</div>
              <div className="text-sm font-medium">+91 98765 43210</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-700">
            <div className="bg-slate-100 p-2 rounded-full"><Mail className="w-4 h-4" /></div>
            <div>
              <div className="text-xs text-slate-500">Sales Desk</div>
              <div className="text-sm font-medium">sales@sharmaelec.com</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-700">
            <div className="bg-slate-100 p-2 rounded-full"><MapPin className="w-4 h-4" /></div>
            <div>
              <div className="text-xs text-slate-500">Warehouse</div>
              <div className="text-sm font-medium">Okhla Phase 2, New Delhi</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-6 text-slate-900">Recent Interactions</h2>
              <Timeline events={[
                { title: 'Invoice #4992 Uploaded', date: 'Oct 12, 2023', description: 'Purchased 10 Samsung 55" Smart TVs for upcoming Diwali sale.' },
                { title: 'Payment Sent', date: 'Oct 15, 2023', description: 'Cleared outstanding balance of ₹3,60,000 via NEFT.' },
                { title: 'Price Inquiry', date: 'Sep 05, 2023', description: 'Inquired about bulk discount for LG 1.5 Ton ACs.' }
              ]} />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="bg-primary text-white border-none">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-6 opacity-90">Relationship Summary</h2>
              <div className="space-y-6">
                <div>
                  <div className="text-sm opacity-75 mb-1">Lifetime Spend</div>
                  <div className="text-3xl font-bold">₹45,20,000</div>
                </div>
                <div className="pt-4 border-t border-white/20">
                  <div className="text-sm opacity-75 mb-1">Active Warranties</div>
                  <div className="text-xl font-semibold flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    14 items
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-slate-900">Recent Documents</h2>
              <div className="space-y-3">
                <Link href="/documents/1" className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-slate-100 transition-colors group">
                  <div className="flex items-center gap-3">
                    <Receipt className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                    <div>
                      <div className="text-sm font-medium text-slate-900">INV-4992.pdf</div>
                      <div className="text-xs text-slate-500">Oct 12, 2023</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link href="/documents/2" className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-slate-100 transition-colors group">
                  <div className="flex items-center gap-3">
                    <Receipt className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                    <div>
                      <div className="text-sm font-medium text-slate-900">INV-4850.pdf</div>
                      <div className="text-xs text-slate-500">Sep 01, 2023</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
