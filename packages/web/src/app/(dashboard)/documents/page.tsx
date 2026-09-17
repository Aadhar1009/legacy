import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UploadCloud, FileText } from 'lucide-react';
import Link from 'next/link';

export default function Documents() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
        <Button><UploadCloud className="w-4 h-4 mr-2" /> Upload</Button>
      </div>
      
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center bg-white hover:bg-slate-50 transition-colors cursor-pointer">
        <UploadCloud className="w-12 h-12 mx-auto text-slate-400 mb-4" />
        <h3 className="text-lg font-medium text-slate-900">Drag & drop files here</h3>
        <p className="text-sm text-slate-500 mt-1 mb-4">Supports PDF, JPG, PNG, CSV, XLSX up to 10MB</p>
        <Button variant="outline">Browse Files</Button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Document Name</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Upload Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 font-medium">
                  <Link href="/documents/1" className="flex items-center text-primary group-hover:underline">
                    <FileText className="w-4 h-4 mr-2 text-slate-400"/> 
                    invoice_sharma_oct.pdf
                  </Link>
                </td>
                <td className="px-6 py-4"><Badge variant="outline">Invoice</Badge></td>
                <td className="px-6 py-4 text-slate-600">Oct 12, 2023</td>
                <td className="px-6 py-4"><Badge status="HIGH">Processed</Badge></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
