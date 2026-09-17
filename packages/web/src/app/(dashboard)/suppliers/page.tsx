import { Input } from '@/components/ui/input';
import { Search, Building2, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function Suppliers() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Suppliers</h1>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          <Input className="pl-10 bg-white" placeholder="Search suppliers..." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3].map((i) => (
          <Link key={i} href={`/suppliers/${i}`} className="block group">
            <div className="bg-white border rounded-xl p-6 hover:shadow-lg transition-all hover:border-primary/50 h-full flex flex-col">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                  <Building2 className="w-6 h-6 text-primary group-hover:text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-slate-900 group-hover:text-primary transition-colors">Sharma Electronics</h3>
                  <div className="flex items-center text-sm text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 mr-1" /> New Delhi
                  </div>
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-end">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Total Spend YTD</div>
                  <div className="text-lg font-bold text-slate-900">₹12,50,000</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 mb-1">Last Purchase</div>
                  <div className="text-sm font-medium text-slate-700">2 wks ago</div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
