"use client";

import Image from "next/image";
import { Invoice } from "@/lib/salesTypes";
import { formatISTDate } from "@/lib/dateUtils";
import { CheckCircle2, AlertCircle, Clock, QrCode } from "lucide-react";

interface A4InvoiceViewProps {
  invoice: Invoice;
  showPrintActions?: boolean;
  onPrint?: () => void;
  onClose?: () => void;
}

// Convert numbers to Indian Rupees in words
function numberToWordsINR(num: number): string {
  if (!num || num === 0) return "Zero Rupees Only";
  
  const a = [
    "",
    "One ",
    "Two ",
    "Three ",
    "Four ",
    "Five ",
    "Six ",
    "Seven ",
    "Eight ",
    "Nine ",
    "Ten ",
    "Eleven ",
    "Twelve ",
    "Thirteen ",
    "Fourteen ",
    "Fifteen ",
    "Sixteen ",
    "Seventeen ",
    "Eighteen ",
    "Nineteen ",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function inWords(n: number): string {
    let str = "";
    if (n > 99) {
      str += a[Math.floor(n / 100)] + "Hundred ";
      n %= 100;
    }
    if (n > 19) {
      str += b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : " ");
    } else if (n > 0) {
      str += a[n];
    }
    return str;
  }

  const rounded = Math.round(num);
  let crore = Math.floor(rounded / 10000000);
  let rem = rounded % 10000000;
  let lakh = Math.floor(rem / 100000);
  rem = rem % 100000;
  let thousand = Math.floor(rem / 1000);
  rem = rem % 1000;

  let result = "";
  if (crore > 0) result += inWords(crore) + "Crore ";
  if (lakh > 0) result += inWords(lakh) + "Lakh ";
  if (thousand > 0) result += inWords(thousand) + "Thousand ";
  if (rem > 0) result += inWords(rem);

  return `Rupees ${result.trim()} Only`;
}

export default function A4InvoiceView({
  invoice,
}: A4InvoiceViewProps) {
  const isPaid = invoice.paymentStatus === "Paid";
  const isPartial = invoice.paymentStatus === "Partial";

  // Calculate tax breakdown (CGST + SGST if applicable)
  const halfTaxRate = invoice.taxRate ? (invoice.taxRate / 2).toFixed(1) : "0";
  const halfTaxAmount = invoice.taxAmount ? (invoice.taxAmount / 2).toFixed(2) : "0";

  return (
    <div
      id="printable-invoice"
      className="a4-invoice-page bg-white text-slate-900 mx-auto w-full max-w-[210mm] min-h-[297mm] p-[10mm] sm:p-[12mm] flex flex-col justify-between box-border border border-slate-200 sm:shadow-xl print:shadow-none print:border-none print:p-0 print:m-0 print:w-full print:max-w-none print:min-h-0"
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div>
        {/* Top Header Section */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
          <div className="space-y-1 max-w-[60%]">
            <div className="flex items-center gap-2.5">
              <Image
                src="/assets/logo.png"
                alt="RR Tech Services"
                width={180}
                height={48}
                className="h-10 w-auto object-contain"
                priority
              />
              <span className="text-xl font-black tracking-tight text-slate-900">
                RR TECH SERVICES
              </span>
            </div>
            <p className="text-xs font-semibold text-blue-700 tracking-wide uppercase mt-1">
              Refurbished Laptops &bull; IT Hardware &bull; Motherboard Repairs &bull; Accessories
            </p>
            <div className="text-[11px] text-slate-600 leading-relaxed pt-1">
              <p>Shop No. 12, Cyber Hub, MG Road, Pune, Maharashtra - 411001</p>
              <p className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                <span>Phone: <strong className="text-slate-800 font-semibold">+91 9209095278</strong></span>
                <span>Email: <strong className="text-slate-800 font-semibold">business.rrtechservices@gmail.com</strong></span>
              </p>
              <p className="flex gap-4 mt-0.5 text-slate-500 font-mono text-[10px]">
                <span>GSTIN: <strong>27ABCDE1234F1Z5</strong></span>
                <span>PAN: <strong>ABCDE1234F</strong></span>
                <span>State: <strong>Maharashtra (27)</strong></span>
              </p>
            </div>
          </div>

          <div className="text-right flex flex-col items-end">
            <div className="inline-block bg-slate-900 text-white font-black text-xs uppercase px-3 py-1 rounded tracking-wider mb-2">
              TAX / RETAIL INVOICE
            </div>
            <div className="text-xl font-black font-mono text-slate-900 tracking-tight">
              {invoice.invoiceNumber}
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Invoice Date: <strong className="text-slate-900 font-semibold">{formatISTDate(invoice.date)}</strong>
            </div>
            {invoice.dueDate && (
              <div className="text-xs text-slate-500">
                Due Date: <strong className="text-slate-800 font-medium">{formatISTDate(invoice.dueDate)}</strong>
              </div>
            )}
            
            {/* Status Stamp */}
            <div className="mt-2.5">
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  isPaid
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                    : isPartial
                    ? "bg-amber-50 text-amber-800 border-amber-300"
                    : "bg-rose-50 text-rose-700 border-rose-300"
                }`}
              >
                {isPaid ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : isPartial ? (
                  <Clock className="w-3.5 h-3.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5" />
                )}
                STATUS: {invoice.paymentStatus.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Billed To & Payment Overview Grid */}
        <div className="grid grid-cols-2 gap-4 my-5 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
              Billed To (Customer Details):
            </div>
            <div className="text-sm font-black text-slate-900 leading-snug">
              {invoice.customer.name}
            </div>
            <div className="text-slate-700 font-mono mt-0.5">
              Phone: <strong>{invoice.customer.phone}</strong>
            </div>
            {invoice.customer.email && (
              <div className="text-slate-600 truncate mt-0.5">Email: {invoice.customer.email}</div>
            )}
            {invoice.customer.address && (
              <div className="text-slate-600 mt-0.5 leading-tight">Address: {invoice.customer.address}</div>
            )}
            {invoice.customer.gstin && (
              <div className="text-slate-700 font-mono mt-1 text-[11px]">
                Customer GSTIN: <strong>{invoice.customer.gstin}</strong>
              </div>
            )}
          </div>

          <div className="space-y-1 text-right flex flex-col justify-center">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
              Payment Terms &amp; Settlement:
            </div>
            <div className="flex justify-between sm:justify-end sm:gap-6 text-slate-700">
              <span className="text-slate-500">Payment Mode:</span>
              <span className="font-bold text-slate-900">{invoice.paymentMode || "Cash"}</span>
            </div>
            <div className="flex justify-between sm:justify-end sm:gap-6 text-slate-700">
              <span className="text-slate-500">Amount Paid:</span>
              <span className="font-bold text-emerald-700">₹{invoice.amountPaid.toLocaleString("en-IN")}</span>
            </div>
            {invoice.balanceDue > 0 ? (
              <div className="flex justify-between sm:justify-end sm:gap-6 text-rose-700 font-black">
                <span>Balance Due:</span>
                <span>₹{invoice.balanceDue.toLocaleString("en-IN")}</span>
              </div>
            ) : (
              <div className="flex justify-between sm:justify-end sm:gap-6 text-emerald-700 font-bold">
                <span>Balance Due:</span>
                <span>₹0 (Full Settled)</span>
              </div>
            )}
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px] tracking-wider border-b border-slate-300">
                <th className="py-2.5 px-3 text-center w-10">#</th>
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3 text-center">Item Code</th>
                <th className="py-2.5 px-3 text-center w-14">Qty</th>
                <th className="py-2.5 px-3 text-right w-24">Rate (₹)</th>
                <th className="py-2.5 px-3 text-right w-28">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 text-center font-mono text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-900 leading-snug">{item.itemName}</div>
                    {(item.brand || item.model) && (
                      <div className="text-[10.5px] text-slate-500 mt-0.5">
                        Brand: {item.brand} {item.model ? `• Model: ${item.model}` : ""}
                      </div>
                    )}
                    {item.serialNumbers && item.serialNumbers.length > 0 && (
                      <div className="text-[10px] font-mono text-blue-700 font-semibold mt-0.5">
                        Serial / IMEI: {item.serialNumbers.join(", ")}
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-600">
                    {item.itemCode || "-"}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                    {item.quantity}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-700 font-mono">
                    ₹{item.unitPrice.toLocaleString("en-IN")}
                  </td>
                  <td className="py-2.5 px-3 text-right font-black text-slate-900 font-mono">
                    ₹{item.total.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Summary & Amount In Words */}
        <div className="grid grid-cols-12 gap-4 mt-4 text-xs">
          {/* Amount In Words & Bank Details */}
          <div className="col-span-7 flex flex-col justify-between space-y-3">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                Amount Chargeable in Words:
              </span>
              <p className="font-bold text-slate-900 text-xs italic">
                {numberToWordsINR(invoice.grandTotal)}
              </p>
            </div>

            {/* Bank / UPI Payment QR Box */}
            <div className="p-3 rounded-lg border border-dashed border-slate-300 bg-slate-50/60 flex items-center justify-between gap-3 text-[11px]">
              <div>
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block mb-0.5">
                  Bank Transfer / UPI Details
                </span>
                <p className="text-slate-600">Account Name: <strong>RR TECH SERVICES</strong></p>
                <p className="text-slate-600">Bank: <strong>HDFC Bank &bull; A/C: 50200088992211</strong></p>
                <p className="text-slate-600">IFSC Code: <strong>HDFC0001234</strong> &bull; Branch: <strong>Pune Camp</strong></p>
                <p className="text-blue-700 font-mono font-semibold mt-0.5">UPI ID: 9209095278@okbizaxis</p>
              </div>
              <div className="text-center p-1.5 bg-white rounded border border-slate-200 shadow-2xs">
                <QrCode className="w-10 h-10 text-slate-800 mx-auto" />
                <span className="text-[9px] text-slate-500 block font-semibold mt-0.5">Scan to Pay</span>
              </div>
            </div>
          </div>

          {/* Mathematical Totals Box */}
          <div className="col-span-5">
            <div className="space-y-1.5 p-3.5 rounded-lg bg-slate-50 border border-slate-300 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold text-slate-900">
                  ₹{invoice.subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              {invoice.discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Discount:</span>
                  <span className="font-mono font-semibold">
                    -₹{invoice.discount.toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              {invoice.taxRate > 0 && (
                <>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>CGST ({halfTaxRate}%):</span>
                    <span className="font-mono text-slate-700">₹{halfTaxAmount}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>SGST ({halfTaxRate}%):</span>
                    <span className="font-mono text-slate-700">₹{halfTaxAmount}</span>
                  </div>
                </>
              )}

              <div className="border-t-2 border-slate-400 pt-2 flex justify-between text-sm font-black text-slate-900">
                <span>Grand Total:</span>
                <span className="text-blue-700 font-mono">
                  ₹{invoice.grandTotal.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-emerald-700 font-bold border-t border-slate-200 pt-1">
                <span>Amount Paid:</span>
                <span className="font-mono">₹{invoice.amountPaid.toLocaleString("en-IN")}</span>
              </div>

              {invoice.balanceDue > 0 ? (
                <div className="flex justify-between text-[11px] text-rose-700 font-black">
                  <span>Balance Due:</span>
                  <span className="font-mono">₹{invoice.balanceDue.toLocaleString("en-IN")}</span>
                </div>
              ) : (
                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>Balance Due:</span>
                  <span className="font-mono font-bold text-emerald-600">₹0</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Terms and Conditions & Signatory */}
      <div className="border-t border-slate-300 pt-4 mt-6">
        <div className="flex justify-between items-end gap-6 text-[10.5px] text-slate-600">
          <div className="space-y-1 max-w-[62%]">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
              Terms &amp; Conditions
            </span>
            <p>1. Warranty on refurbished hardware as per RR Tech invoice terms; accessories carry brand warranty.</p>
            <p>2. Physical damage, liquid spillage, burn, or seal tampering completely voids warranty.</p>
            <p>3. Goods once sold cannot be returned without technical verification &amp; valid invoice copy.</p>
            <p>4. All disputes are subject to Pune jurisdiction only.</p>
            {invoice.notes && (
              <p className="text-blue-800 font-semibold pt-0.5">Note: {invoice.notes}</p>
            )}
          </div>

          <div className="text-right space-y-10 min-w-[160px]">
            <div>
              <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">
                For RR TECH SERVICES
              </span>
            </div>
            <div className="border-t border-slate-400 pt-1 text-slate-800 font-bold text-xs">
              Authorized Signatory
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-2 border-t border-slate-100 flex justify-between text-[9px] text-slate-400 font-mono">
          <span>This is a computer-generated tax invoice.</span>
          <span>RR Tech Services &bull; GST Registered &bull; Pune Cyber Hub</span>
        </div>
      </div>
    </div>
  );
}
