import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Calendar, MapPin, User, CheckCircle2, Printer, ShieldCheck } from 'lucide-react';

export default function TicketModal({ ticket, isOpen, onClose }) {
  const ticketRef = useRef();

  if (!isOpen || !ticket) return null;

  const handlePrint = () => {
    window.print();
  };

  const startDate = new Date(ticket.start_time);
  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const formattedTime = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-brand-600 to-indigo-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-200" />
            <span className="text-xs uppercase font-bold tracking-wider text-brand-100">Official Campus Event Pass</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Body */}
        <div ref={ticketRef} className="p-6 flex flex-col items-center text-center">
          <div className="mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
              {ticket.category_name || 'Event'}
            </span>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-2 leading-tight">
            {ticket.event_title || ticket.title}
          </h2>

          {/* Ticket ID Box */}
          <div className="my-3 px-4 py-2 bg-slate-100 rounded-xl border border-slate-200 font-mono text-sm font-bold text-slate-800 tracking-wider">
            {ticket.ticket_code}
          </div>

          {/* QR Code */}
          <div className="p-4 my-3 bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
            <QRCodeSVG
              value={JSON.stringify({
                ticket_code: ticket.ticket_code,
                event_id: ticket.event_id,
                attendee: ticket.student_name,
                roll: ticket.roll_number
              })}
              size={140}
              level="H"
              includeMargin={false}
            />
          </div>
          <p className="text-[11px] text-slate-400 mb-5">Scan at entrance for instantaneous attendance verification</p>

          {/* Attendee & Event Details Grid */}
          <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-left text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" /> Attendee
              </span>
              <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                {ticket.student_name || 'Registered Student'}
              </span>
            </div>

            {ticket.roll_number && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Roll Number</span>
                <span className="font-semibold text-slate-800 font-mono">{ticket.roll_number}</span>
              </div>
            )}

            {ticket.department && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Department</span>
                <span className="font-semibold text-slate-800 truncate max-w-[180px]">{ticket.department}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Schedule
              </span>
              <span className="font-semibold text-slate-800">
                {formattedDate} • {formattedTime}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Venue
              </span>
              <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                {ticket.venue_name}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-slate-500">Attendance Status</span>
              <span
                className={`font-bold uppercase tracking-wider text-[11px] px-2 py-0.5 rounded-full ${
                  ticket.attendance_status === 'present'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {ticket.attendance_status === 'present' ? 'Verified Present' : 'Registered / Ready'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-100/80 border-t border-slate-200 flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" /> Print / Save Pass
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
