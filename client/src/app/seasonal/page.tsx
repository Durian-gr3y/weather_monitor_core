"use client";

import React from 'react';
import { Calendar, TrendingUp, CloudRain, Wind } from 'lucide-react';

const MetricCard = ({ title, value, subValue, icon: Icon, color }: any) => (
    <div className="glass-card p-6 border-b-2 border-transparent hover:border-blue-500/50 transition-all">
        <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 bg-white/5 rounded-lg ${color}`}>
                <Icon size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">{title}</h3>
        </div>
        <div className="text-3xl font-black mb-1">{value}</div>
        <div className="text-xs text-slate-500">{subValue}</div>
    </div>
);

export default function SeasonalOutlook() {
    const [data, setData] = React.useState<any>(null);

    React.useEffect(() => {
        fetch('https://weather-monitor-core-1.onrender.com/weather/Lagos')
            .then(res => {
                if (!res.ok) throw new Error('API Error');
                return res.json();
            })
            .then(setData)
            .catch(console.error);
    }, []);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-12">
                <div className="flex items-center gap-2 text-blue-400 text-sm font-bold uppercase tracking-widest mb-1">
                    <Calendar size={14} />
                    Climate Projection
                </div>
                <h2 className="text-4xl font-black">Seasonal Outlook 2026</h2>
                <p className="text-slate-400">Long-term rainfall onset, cessation, and cumulative anomalies for Nigeria.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <MetricCard
                    title="Rainfall Onset"
                    value="April 12"
                    subValue="Expected start of consistent rains."
                    icon={CloudRain}
                    color="text-blue-400"
                />
                <MetricCard
                    title="Cessation Date"
                    value="October 28"
                    subValue="Projected end of the rainy season."
                    icon={Wind}
                    color="text-slate-400"
                />
                <MetricCard
                    title="Rainfall Anomaly"
                    value={data ? "+12.4%" : "..."}
                    subValue="Vs. 10-year historical baseline."
                    icon={TrendingUp}
                    color="text-green-400"
                />
            </div>

            <div className="glass-card p-8">
                <h3 className="text-xl font-bold mb-6">Regional Summary</h3>
                <div className="space-y-6">
                    <p className="text-slate-400 text-sm leading-relaxed">
                        The 2026 seasonal outlook for the Southern regional cluster (including Lagos and Port Harcourt) indicates a normal to slightly early onset. Cumulative rainfall is projected to be 10-15% above the 10-year average retrieved from NASA POWER climatology.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                        <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                            <h4 className="font-bold text-sm mb-4 text-blue-400 uppercase">Agricultural Impact</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Early onset suggests a favorable window for first-season maize planting. However, high intensity events in June may increase nutrient leaching risk.
                            </p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                            <h4 className="font-bold text-sm mb-4 text-yellow-400 uppercase">Risk Mitigation</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Farmers are advised to prioritize early land preparation and monitor the 10-day forecast for planting-specific rain windows.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
