import { Badge } from '@/components/ui/badge';
import { ConfidenceBadge } from '@/components/business/confidence-badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';

export default function DocumentDetail({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/documents" className="mr-4 p-2 hover:bg-slate-200 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">invoice_sharma_oct.pdf</h1>
            <p className="text-sm text-slate-500">Uploaded Oct 12, 2023</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Delete</Button>
          <Button><Check className="w-4 h-4 mr-2" /> Approve Extraction</Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
        <div className="w-full md:w-1/2 bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden shadow-inner relative group">
          <p className="text-slate-400">PDF Viewer Placeholder</p>
          <div className="absolute top-4 right-4 bg-slate-900/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-md text-sm font-medium">
            Page 1 of 1
          </div>
        </div>
        
        <div className="w-full md:w-1/2 bg-white rounded-lg border shadow-sm p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Extracted Information</h2>
            <Badge status="HIGH">AI Confident</Badge>
          </div>
          
          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 group hover:border-primary/30 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <label className="block text-sm font-medium text-slate-700">Supplier Name</label>
                <ConfidenceBadge level="HIGH" />
              </div>
              <input 
                className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                defaultValue="Sharma Electronics" 
              />
            </div>
            
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 group hover:border-primary/30 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <label className="block text-sm font-medium text-slate-700">Invoice Number</label>
                <ConfidenceBadge level="HIGH" />
              </div>
              <input 
                className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                defaultValue="INV-4992" 
              />
            </div>
            
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 group hover:border-primary/30 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <label className="block text-sm font-medium text-slate-700">Total Amount</label>
                <ConfidenceBadge level="HIGH" />
              </div>
              <input 
                className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                defaultValue="₹360,000" 
              />
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex justify-between items-start mb-4">
                <label className="block text-sm font-medium text-slate-700">Line Items</label>
                <ConfidenceBadge level="MEDIUM" />
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="pb-2 font-medium">Item</th>
                    <th className="pb-2 font-medium">Qty</th>
                    <th className="pb-2 font-medium text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2">Samsung 55" Smart TV</td>
                    <td className="py-2">10</td>
                    <td className="py-2 text-right">₹36,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
