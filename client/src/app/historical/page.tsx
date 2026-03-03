"use client";

import React from 'react';
import { History, Download, FileSpreadsheet, Table } from 'lucide-react';

export default function HistoricalData() {
    const [history, setHistory] = React.useState<any[]>([]);

    React.useEffect(() => {
        fetch('https://weather-monitor-core-1.onrender.com/history/Lagos')
            .then(res => {
                if (!res.ok) throw new Error('API Error');
                return res.json();
            })
            .then(setHistory)
            .catch(console.error);
    }, []);

    const displayHistory = history.length > 0 ? history.map(h => ({
        date: new Date(h.timestamp).toLocaleDateString(),
        temp: `${h.temp}°C`,
        rain: `${h.precip_24h}mm`,
        risk: h.pest_risk || "LOW"
    })) : [
        { date: "2026-03-01", temp: "29.4°C", rain: "12mm", risk: "LOW" },
        { date: "2026-02-28", temp: "30.1°C", rain: "0mm", risk: "LOW" },
        { date: "2026-02-27", temp: "28.9°C", rain: "45mm", risk: "MODERATE" },
        { date: "2026-02-26", temp: "31.2°C", rain: "0.5mm", risk: "LOW" },
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div>
                    <div className="flex items-center gap-2 text-blue-400 text-sm font-bold uppercase tracking-widest mb-1">
                        <History size={14} />
                        Data Archive
                    </div>
                    <h2 className="text-4xl font-black">Historical Trends</h2>
                    <p className="text-slate-400">Access and download historical weather data for research purposes.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-900/20">
                    <Download size={18} />
                    Download CSV
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
                <div className="lg:col-span-3 glass-card overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                        <h3 className="font-bold flex items-center gap-2"><Table size={18} /> Recent Observations</h3>
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Showing last 4 entries</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-medium">
                            <thead>
                                <tr className="bg-white/5 text-[10px] text-slate-500 uppercase tracking-widest">
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Avg Temp</th>
                                    <th className="px-6 py-4">Total Rain</th>
                                    <th className="px-6 py-4">Risk Profile</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-white/5">
                                {displayHistory.map((row, i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-slate-300 font-mono">{row.date}</td>
                                        <td className="px-6 py-4">{row.temp}</td>
                                        <td className="px-6 py-4">{row.rain}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${row.risk === 'MODERATE' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-green-500/10 text-green-400'
                                                }`}>
                                                {row.risk}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card p-6 bg-blue-500/5 border-blue-500/20">
                        <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                            <FileSpreadsheet size={16} className="text-blue-400" />
                            Custom Reports
                        </h4>
                        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                            Generate long-tail historical reports (3-6 months) for specific regional clusters in Nigeria.
                        </p>
                        <button className="w-full py-2 text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg transition-all">
                            Request Full Dataset
                        </button>
                    </div>
                    <div className="glass-card p-6">
                        <h4 className="text-sm font-bold mb-2">Export Metadata</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px]">
                                <span className="text-slate-500">Format</span>
                                <span className="text-slate-300">CSV / JSON</span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                                <span className="text-slate-500">API Source</span>
                                <span className="text-slate-300">Open-Meteo v1</span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                                <span className="text-slate-500">Coverage</span>
                                <span className="text-slate-300">64 Cities</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
